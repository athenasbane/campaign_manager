import test from "node:test";
import assert from "node:assert/strict";
import { gzipSync } from "node:zlib";
import { createDynamoService } from "./dynamo-store.mjs";
const gm = { sub: "gm", gm: true };
function mock() {
  const rows = new Map([
    [
      "luxtria|campaign",
      {
        pk: "luxtria",
        sk: "campaign",
        payload: gzipSync(
          JSON.stringify({
            id: "luxtria",
            data: JSON.stringify({
              id: "luxtria",
              name: "Luxtria",
              primerId: null,
            }),
          }),
        ),
      },
    ],
  ]);
  let conflict = false;
  let denied = false;
  const calls = [];
  return {
    rows,
    calls,
    conflict: () => {
      conflict = true;
    },
    deny: () => {
      denied = true;
    },
    client: {
      async send(command) {
        const c = command.constructor.name;
        const i = command.input;
        calls.push({ c, i });
        const index = (key) => `${key.pk}|${key.sk}`;
        if (c === "GetCommand") return { Item: rows.get(index(i.Key)) };
        if (c === "QueryCommand")
          return {
            Items: [...rows.values()].filter(
              (r) =>
                r.pk === i.ExpressionAttributeValues[":pk"] &&
                r.sk.startsWith(i.ExpressionAttributeValues[":prefix"]),
            ),
          };
        if (c === "UpdateCommand") {
          if (denied)
            throw Object.assign(new Error(), {
              name: "ConditionalCheckFailedException",
            });
          return {};
        }
        if (c === "TransactWriteCommand") {
          if (conflict)
            throw Object.assign(new Error(), {
              name: "TransactionCanceledException",
            });
          const update = i.TransactItems[0].Update;
          const prior = rows.get(index(update.Key))?.version || 0;
          if (prior !== (update.ExpressionAttributeValues[":prior"] || 0))
            throw Object.assign(new Error(), {
              name: "TransactionCanceledException",
            });
          rows.set(index(update.Key), {
            ...update.Key,
            version: update.ExpressionAttributeValues[":next"],
          });
          for (const action of i.TransactItems.slice(1)) {
            if (action.Put) rows.set(index(action.Put.Item), action.Put.Item);
            if (action.Delete) rows.delete(index(action.Delete.Key));
          }
          return {};
        }
        throw new Error(c);
      },
    },
  };
}
const entry = (id, audience = { visibility: "public" }) => ({
  id,
  type: "lore",
  title: id,
  body: "Café city lore.",
  audience,
});
async function write(s, id, audience) {
  return s.execute("write", "luxtria", gm, {
    entry: entry(id, audience),
    expectedVersion: 0,
    mutationId: `write-${id}`,
  });
}
async function publish(s, id) {
  return s.execute("publish", "luxtria", gm, id, {
    expectedVersion: 1,
    mutationId: `publish-${id}`,
  });
}
test("durable cold reads retain privacy, publication, accents and character boundaries", async () => {
  const m = mock();
  const s = createDynamoService(m.client, "test");
  await s.execute("saveCharacter", "luxtria", gm, {
    characterId: "alice",
    characterName: "Alice",
    userSub: "alice",
  });
  await write(s, "public");
  await publish(s, "public");
  await write(s, "private", {
    visibility: "characters",
    characterIds: ["alice"],
  });
  await publish(s, "private");
  await write(s, "draft");
  const cold = createDynamoService(m.client, "test");
  const publicResult = await cold.execute("search", "luxtria", null, {
    q: "cafe",
  });
  assert.equal(publicResult.total, 1);
  assert.equal(publicResult.items[0].id, "public");
  await assert.rejects(
    cold.execute("read", "luxtria", null, "private"),
    (e) => e.status === 404,
  );
  assert.equal(
    (await cold.execute("search", "luxtria", { sub: "alice" })).total,
    2,
  );
  assert.equal((await cold.execute("listDrafts", "luxtria", gm)).total, 3);
  assert.equal(
    (await cold.execute("atlas", "luxtria", null, "luxtria")).features.length,
    16,
  );
  assert.ok(
    !m.calls
      .filter((x) => x.c === "QueryCommand")
      .at(-1)
      .i.ExpressionAttributeValues[":prefix"].startsWith("draft"),
  );
});
test("publication withdrawals and reader state survive new service instances", async () => {
  const m = mock();
  const s = createDynamoService(m.client, "test");
  await s.execute("saveCharacter", "luxtria", gm, {
    characterId: "alice",
    characterName: "Alice",
    userSub: "alice",
  });
  await write(s, "note");
  await publish(s, "note");
  await s.execute("readerState", "luxtria", { sub: "alice" }, "note", {
    read: true,
    bookmarked: true,
  });
  assert.equal(
    (
      await createDynamoService(m.client, "test").execute(
        "search",
        "luxtria",
        { sub: "alice" },
        { bookmarked: "true" },
      )
    ).total,
    1,
  );
  await s.execute("unpublish", "luxtria", gm, "note", {
    expectedVersion: 1,
    mutationId: "withdraw",
  });
  await assert.rejects(
    s.execute("read", "luxtria", null, "note"),
    (e) => e.status === 404,
  );
  assert.equal(
    (await s.execute("getDraft", "luxtria", gm, "note")).draft.title,
    "note",
  );
});
test("idempotency, revision restore and stale transaction rejection are atomic", async () => {
  const m = mock();
  const s = createDynamoService(m.client, "test");
  await write(s, "one");
  const count = m.calls.filter((x) => x.c === "TransactWriteCommand").length;
  await write(s, "one");
  assert.equal(
    m.calls.filter((x) => x.c === "TransactWriteCommand").length,
    count,
  );
  await s.execute("restore", "luxtria", gm, "one", {
    version: 1,
    expectedVersion: 1,
    mutationId: "restore",
  });
  assert.equal(
    (await s.execute("getDraft", "luxtria", gm, "one")).draft.version,
    2,
  );
  m.conflict();
  await assert.rejects(write(s, "two"), (e) => e.status === 409);
  assert.ok(!m.rows.has("luxtria|draft#two"));
  await assert.rejects(
    s.execute("importApply", "luxtria", gm, { entries: Array(26).fill({}) }),
    (e) => e.status === 400,
  );
});
test("usage checks fail closed, enforce both counters, and cache rejections", async () => {
  const m = mock();
  const s = createDynamoService(m.client, "test");
  await s.quota();
  const update = m.calls[0].i;
  assert.equal(update.ExpressionAttributeValues[":daily"], 1000);
  assert.equal(update.ExpressionAttributeValues[":monthly"], 10000);
  assert.ok(update.ConditionExpression.includes("AND"));
  m.deny();
  await assert.rejects(s.quota(), (e) => e.status === 429);
  const count = m.calls.length;
  await assert.rejects(s.quota(), (e) => e.status === 429);
  assert.equal(m.calls.length, count);
});

test("25-note private import fits one transaction without publication deletes", async () => {
  const m = mock();
  const s = createDynamoService(m.client, "test");
  const result = await s.execute("importApply", "luxtria", gm, {
    mutationId: "bulk",
    entries: Array.from({ length: 25 }, (_, i) => ({
      entry: entry(`note-${i}`, { visibility: "gm" }),
      expectedVersion: 0,
    })),
  });
  assert.equal(result.saved, 25);
  const transaction = m.calls.find((c) => c.c === "TransactWriteCommand").i
    .TransactItems;
  assert.equal(transaction.length, 77);
  assert.ok(transaction.every((action) => !action.Delete));
  assert.equal((await s.execute("search", "luxtria", null)).total, 0);
});
