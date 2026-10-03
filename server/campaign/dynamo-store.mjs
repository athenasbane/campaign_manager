import { gzipSync, gunzipSync } from "node:zlib";
import { randomUUID } from "node:crypto";
import {
  GetCommand,
  QueryCommand,
  TransactWriteCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { createStore } from "./store.mjs";
import {
  createCampaignService,
  CampaignError,
  entrySearchBody,
} from "./service.mjs";

// DynamoDB owns durable rows. SQLite is a disposable, per-operation relational
// view used by the existing permission rules and FTS search, never durable /tmp.
// Revision history and audit records are fetched only when needed; readers
// never hydrate drafts. A campaign revision protects atomic commits and reads.
const columns = {
  campaigns: ["id", "data"],
  members: ["campaign", "character_id", "user_sub", "data"],
  entries: ["campaign", "id", "version", "draft", "published", "updated_at"],
  revisions: ["campaign", "id", "version", "data"],
  mutations: ["campaign", "id", "fingerprint", "result"],
  read_state: [
    "campaign",
    "character_id",
    "entry_id",
    "version",
    "bookmarked",
    "personal_notes",
  ],
};
const encode = (row) => {
  const value = gzipSync(Buffer.from(JSON.stringify(row)));
  if (value.length > 350_000)
    throw new CampaignError(
      413,
      "This note is too large for campaign storage.",
    );
  return value;
};
const decode = (item) =>
  JSON.parse(
    gunzipSync(item.payload, {
      maxOutputLength: 4 * 1024 * 1024,
    }).toString(),
  );
const key = (table, row) => {
  switch (table) {
    case "campaigns":
      return "campaign";
    case "members":
      return `member#${row.character_id}`;
    case "entries":
      return `draft#${row.id}`;
    case "revisions":
      return `revision#${row.id}#${row.version}`;
    case "mutations":
      return `mutation#${row.id}`;
    case "read_state":
      return `state#${row.character_id}#${row.entry_id}`;
    default:
      throw new Error("Unknown durable table");
  }
};
function snapshot(db) {
  return new Map(
    Object.keys(columns).flatMap((table) =>
      db
        .prepare(`SELECT * FROM ${table}`)
        .all()
        .map((row) => [key(table, row), { table, row: { ...row } }]),
    ),
  );
}
const writes = new Set([
  "readerState",
  "saveCharacter",
  "updateCampaign",
  "write",
  "publish",
  "unpublish",
  "restore",
  "importApply",
]);
export function createDynamoService(
  client,
  tableName,
  { dailyLimit = 1000, monthlyLimit = 10000 } = {},
) {
  const send = (Command, input) =>
    client.send(new Command({ TableName: tableName, ...input }));
  const get = async (pk, sk) =>
    (
      await send(GetCommand, {
        Key: { pk, sk },
        ConsistentRead: true,
      })
    ).Item;
  async function query(pk, prefix) {
    const items = [];
    let cursor;
    let bytes = 0;
    do {
      const page = await send(QueryCommand, {
        KeyConditionExpression: "pk = :pk AND begins_with(sk, :prefix)",
        ExpressionAttributeValues: { ":pk": pk, ":prefix": prefix },
        ConsistentRead: true,
        ExclusiveStartKey: cursor,
        Limit: 25,
      });
      for (const item of page.Items || []) {
        bytes += item.payload.length;
        if (bytes > 8 * 1024 * 1024 || items.length >= 5000)
          throw new CampaignError(
            503,
            "Campaign library needs a storage review before growing further.",
          );
        items.push(item);
      }
      cursor = page.LastEvaluatedKey;
    } while (cursor);
    return items;
  }
  const blockedUntil = new Map();
  async function quota(now = new Date()) {
    const date = now.toISOString().slice(0, 10);
    const month = date.slice(0, 7);
    const counterKey = { pk: "quota", sk: month };
    if ((blockedUntil.get(month) || 0) > now.getTime())
      throw new CampaignError(
        429,
        "Campaign usage limit reached. Please try later.",
      );
    try {
      await send(UpdateCommand, {
        Key: counterKey,
        UpdateExpression: "SET expires = :expires ADD #day :one, #month :one",
        ConditionExpression:
          "(attribute_not_exists(#day) OR #day < :daily) AND (attribute_not_exists(#month) OR #month < :monthly)",
        ExpressionAttributeNames: {
          "#day": `day-${date}`,
          "#month": "requests",
        },
        ExpressionAttributeValues: {
          ":one": 1,
          ":daily": dailyLimit,
          ":monthly": monthlyLimit,
          ":expires": Math.floor(now.getTime() / 1000) + 100 * 86400,
        },
      });
    } catch (error) {
      if (error.name !== "ConditionalCheckFailedException") throw error;
      // Avoid paid database work on repeated rejected requests. This is a
      // rejection cache only; admission always checks the durable counter.
      blockedUntil.set(month, now.getTime() + 60_000);
      throw new CampaignError(
        429,
        "Campaign usage limit reached. Please try later.",
      );
    }
  }
  async function execute(operation, id, actor, ...args) {
    if (id !== "luxtria") throw new CampaignError(404, "Campaign not found.");
    if (operation === "importApply" && args[0]?.entries?.length > 25)
      throw new CampaignError(
        400,
        "Cloud imports accept at most 25 notes per atomic batch.",
      );
    const gmOperation =
      operation.startsWith("import") ||
      [
        "listCharacters",
        "saveCharacter",
        "updateCampaign",
        "getDraft",
        "listDrafts",
        "write",
        "preview",
        "previewCharacter",
        "publish",
        "unpublish",
        "restore",
      ].includes(operation);
    if (gmOperation && !actor?.gm)
      throw new CampaignError(403, "GM access is required.");
    const mutating = writes.has(operation);
    // Retry only a read whose materialized view raced a successful write.
    for (let attempt = 0; attempt < 2; attempt++) {
      const version = (await get(id, "version"))?.version || 0;
      const campaignItem = await get(id, "campaign");
      if (!campaignItem)
        throw new CampaignError(503, "Campaign storage is not initialized.");
      const db = createStore();
      let materializedBytes = 0;
      const hydrate = (item) => {
        const row = decode(item);
        materializedBytes += Buffer.byteLength(JSON.stringify(row));
        if (materializedBytes > 32 * 1024 * 1024)
          throw new CampaignError(
            503,
            "Campaign library needs a storage review before growing further.",
          );
        return row;
      };
      try {
        db.prepare("UPDATE campaigns SET data = ? WHERE id = ?").run(
          hydrate(campaignItem).data,
          id,
        );
        const memberItems = await query(id, "member#");
        const members = memberItems.map(hydrate);
        const own = members.find((row) => row.user_sub === actor?.sub);
        const durable = [
          ...memberItems.map((item) => ({
            table: "members",
            row: hydrate(item),
          })),
          ...(gmOperation ? await query(id, "draft#") : []).map((item) => ({
            table: "entries",
            row: hydrate(item),
          })),
          ...(own ? await query(id, `state#${own.character_id}#`) : []).map(
            (item) => ({ table: "read_state", row: hydrate(item) }),
          ),
        ];
        for (const { table, row } of durable) {
          const names = columns[table];
          db.prepare(
            `INSERT OR REPLACE INTO ${table} (${names.join(",")}) VALUES (${names.map(() => "?").join(",")})`,
          ).run(
            ...names.map(
              (name) => row[name] ?? (name === "personal_notes" ? "" : null),
            ),
          );
        }
        for (const item of await query(id, "publications#")) {
          const entry = hydrate(item);
          const serialized = JSON.stringify(entry);
          db.prepare(
            `INSERT INTO entries VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT (campaign, id) DO UPDATE SET published = excluded.published`,
          ).run(
            id,
            entry.id,
            entry.version,
            serialized,
            serialized,
            entry.updatedAt,
          );
          db.prepare(
            "INSERT INTO entry_search VALUES (?, ?, ?, ?, ?, ?, ?)",
          ).run(
            id,
            entry.id,
            entry.title,
            entry.aliases.join(" "),
            entry.summary,
            entrySearchBody(entry),
            entry.tags.join(" "),
          );
        }
        const input =
          operation === "write" || operation === "importApply"
            ? args[0]
            : args[1];
        if (input?.mutationId) {
          const prior = await get(id, `mutation#${input.mutationId}`);
          if (prior) {
            const row = hydrate(prior);
            db.prepare("INSERT INTO mutations VALUES (?, ?, ?, ?)").run(
              id,
              row.id,
              row.fingerprint,
              row.result,
            );
          }
        }
        if (operation === "restore") {
          const prior = await get(
            id,
            `revision#${args[0]}#${args[1]?.version}`,
          );
          if (prior) {
            const row = hydrate(prior);
            db.prepare("INSERT INTO revisions VALUES (?, ?, ?, ?)").run(
              id,
              row.id,
              row.version,
              row.data,
            );
          }
        }
        if (((await get(id, "version"))?.version || 0) !== version) {
          if (!mutating && attempt === 0) continue;
          throw new CampaignError(
            409,
            "Campaign changed. Please retry the operation.",
          );
        }
        const before = snapshot(db);
        const service = createCampaignService(db);
        if (typeof service[operation] !== "function")
          throw new CampaignError(404, "Endpoint not found.");
        const result = service[operation](id, actor, ...args);
        if (!mutating) return result;
        const puts = new Map();
        for (const [sk, { table, row }] of snapshot(db)) {
          if (JSON.stringify(before.get(sk)?.row) === JSON.stringify(row))
            continue;
          puts.set(sk, {
            Put: {
              TableName: tableName,
              Item: { pk: id, sk, payload: encode(row) },
            },
          });
          if (
            table === "entries" &&
            (row.published || null) !== (before.get(sk)?.row.published || null)
          ) {
            const publicationKey = `publications#${row.id}`;
            puts.set(
              publicationKey,
              row.published
                ? {
                    Put: {
                      TableName: tableName,
                      Item: {
                        pk: id,
                        sk: publicationKey,
                        payload: encode(JSON.parse(row.published)),
                      },
                    },
                  }
                : {
                    Delete: {
                      TableName: tableName,
                      Key: { pk: id, sk: publicationKey },
                    },
                  },
            );
          }
        }
        for (const row of db.prepare("SELECT * FROM audit").all()) {
          const sk = `audit#${row.at}#${randomUUID()}`;
          puts.set(sk, {
            Put: {
              TableName: tableName,
              Item: { pk: id, sk, payload: encode(row) },
            },
          });
        }
        if (!puts.size) return result; // An idempotent retry has nothing to commit.
        const actions = [...puts.values()];
        if (
          actions.length > 99 ||
          actions.reduce(
            (bytes, action) =>
              bytes + (action.Put?.Item.payload.byteLength || 0) + 512,
            0,
          ) > 3_500_000
        )
          throw new CampaignError(
            413,
            "Batch is too large. Import fewer notes at a time.",
          );
        try {
          await client.send(
            new TransactWriteCommand({
              TransactItems: [
                {
                  Update: {
                    TableName: tableName,
                    Key: { pk: id, sk: "version" },
                    UpdateExpression: "SET #version = :next",
                    ConditionExpression: version
                      ? "#version = :prior"
                      : "attribute_not_exists(#version)",
                    ExpressionAttributeNames: { "#version": "version" },
                    ExpressionAttributeValues: {
                      ":next": version + 1,
                      ...(version ? { ":prior": version } : {}),
                    },
                  },
                },
                ...actions,
              ],
            }),
          );
        } catch (error) {
          if (error.name === "TransactionCanceledException")
            throw new CampaignError(
              409,
              "Campaign changed or is busy. Retry with the same mutation ID.",
            );
          throw error;
        }
        return result;
      } finally {
        db.close();
      }
    }
    throw new CampaignError(409, "Campaign changed. Please retry.");
  }
  return { quota, execute };
}
