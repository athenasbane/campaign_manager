import "../server/campaign/env.mjs";
import { DatabaseSync } from "node:sqlite";
import { resolve } from "node:path";
import { gzipSync } from "node:zlib";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { createDynamoService } from "../server/campaign/dynamo-store.mjs";
const TableName = "luxtria-campaign-data";
const client = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: "eu-west-2", maxAttempts: 8 }),
);
const db = new DatabaseSync(
  resolve(process.env.LUXTRIA_DB_PATH || ".local/luxtria.sqlite"),
  { readOnly: true },
);
try {
  const campaign = db
    .prepare("SELECT * FROM campaigns WHERE id = ?")
    .get("luxtria");
  if (
    !(
      await client.send(
        new GetCommand({
          TableName,
          Key: { pk: "luxtria", sk: "campaign" },
          ConsistentRead: true,
        }),
      )
    ).Item
  ) {
    await client.send(
      new PutCommand({
        TableName,
        Item: {
          pk: "luxtria",
          sk: "campaign",
          payload: gzipSync(JSON.stringify(campaign)),
        },
        ConditionExpression: "attribute_not_exists(pk)",
      }),
    );
  }
  const service = createDynamoService(client, TableName);
  const notes = [];
  const existing = new Set();
  let cursor;
  do {
    const page = await client.send(
      new QueryCommand({
        TableName,
        KeyConditionExpression: "pk = :pk AND begins_with(sk, :prefix)",
        ExpressionAttributeValues: { ":pk": "luxtria", ":prefix": "draft#" },
        ProjectionExpression: "sk",
        ConsistentRead: true,
        ExclusiveStartKey: cursor,
      }),
    );
    for (const row of page.Items || []) existing.add(row.sk);
    cursor = page.LastEvaluatedKey;
  } while (cursor);
  for (const row of db
    .prepare(
      "SELECT id, draft, published FROM entries WHERE campaign = ? ORDER BY id",
    )
    .all("luxtria")) {
    if (row.published)
      throw new Error("Migration only accepts unpublished private drafts.");
    const { version, updatedAt, ...entry } = JSON.parse(row.draft);
    if (entry.audience.visibility !== "gm")
      throw new Error("Migration only accepts GM-only drafts.");
    if (!existing.has(`draft#${row.id}`))
      notes.push({ entry, expectedVersion: 0 });
  }
  for (let offset = 0; offset < notes.length; offset += 5) {
    let result;
    for (let attempt = 0; ; attempt++) {
      try {
        result = await service.execute(
          "importApply",
          "luxtria",
          { sub: "gm:initial-migration", gm: true },
          {
            entries: notes.slice(offset, offset + 5),
            mutationId:
              `initial-cloud-drafts-${offset}-${notes[offset].entry.id}`.slice(
                0,
                100,
              ),
          },
        );
        break;
      } catch (error) {
        if (
          attempt >= 8 ||
          ![
            "ProvisionedThroughputExceededException",
            "TransactionCanceledException",
          ].includes(error.name)
        )
          throw error;
        console.log(
          "Fixed capacity busy; waiting before retry without raising capacity.",
        );
        await new Promise((resolve) => setTimeout(resolve, 30000));
      }
    }
    console.log(`Stored ${result.saved} private drafts; no publication.`);
    if (offset + 5 < notes.length)
      await new Promise((resolve) => setTimeout(resolve, 20000));
  }
  console.log(
    `Migration complete: ${notes.length} new GM-only drafts, zero published.`,
  );
} finally {
  db.close();
}
