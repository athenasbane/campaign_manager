import test from "node:test";
import assert from "node:assert/strict";
import { createStore } from "./store.mjs";
import { createCampaignService } from "./service.mjs";

const gm = { sub: "test-gm", gm: true };
const alice = { sub: "alice-account", gm: false };
const bob = { sub: "bob-account", gm: false };
const outsider = { sub: "unassigned-account", gm: false };
function fixture(t) {
  const db = createStore();
  t.after(() => db.close());
  const s = createCampaignService(db);
  for (const [characterId, actor] of [
    ["alice", alice],
    ["bob", bob],
  ])
    s.saveCharacter("luxtria", gm, {
      characterId,
      characterName: characterId,
      userSub: actor.sub,
    });
  let n = 0;
  function draft(
    id,
    audience = { visibility: "public" },
    fields = {},
    expectedVersion = 0,
  ) {
    return s.write("luxtria", gm, {
      entry: {
        id,
        type: "lore",
        title: id,
        body: "Ordinary city lore.",
        ...fields,
        audience,
      },
      expectedVersion,
      mutationId: `write-${++n}`,
    });
  }
  function publish(id, version = 1) {
    return s.publish("luxtria", gm, id, {
      expectedVersion: version,
      mutationId: `publish-${++n}`,
    });
  }
  return { db, s, draft, publish };
}
const forbidden = (fn, status = 404) =>
  assert.throws(fn, (error) => error.status === status);

test("permission boundaries apply to articles, search totals, facets, backlinks and link labels", (t) => {
  const { s, draft, publish } = fixture(t);
  draft(
    "secret",
    { visibility: "characters", characterIds: ["alice"] },
    { title: "Cobalt Covenant", type: "knowledge", body: "Classified oath" },
  );
  publish("secret");
  draft("shared", { visibility: "characters", characterIds: ["alice", "bob"] });
  publish("shared");
  draft("party", { visibility: "party" });
  publish("party");
  draft(
    "public",
    { visibility: "public" },
    {
      relatedIds: ["secret"],
      body: "The city. [Cobalt Covenant](/world/secret#oath)",
    },
  );
  publish("public");
  draft("unpublished", { visibility: "public" }, { body: "unpublished oath" });
  assert.equal(s.search("luxtria", null).total, 1);
  assert.equal(s.search("luxtria", outsider).total, 1);
  assert.equal(s.search("luxtria", bob).total, 3);
  assert.equal(s.search("luxtria", alice).total, 4);
  assert.deepEqual(s.search("luxtria", bob).types, { lore: 3 });
  assert.equal(s.search("luxtria", bob, { q: "Cobalt" }).total, 0);
  assert.equal(s.search("luxtria", alice, { q: "Cobalt" }).total, 1);
  for (const actor of [null, outsider, bob]) {
    forbidden(() => s.read("luxtria", actor, "secret"));
    forbidden(() => s.read("luxtria", actor, "unpublished"));
    const publicEntry = s.read("luxtria", actor, "public");
    assert.deepEqual(publicEntry.related, []);
    assert.deepEqual(publicEntry.relatedIds, []);
    assert.equal(publicEntry.body, "The city. ");
    assert.ok(!JSON.stringify(s.overview("luxtria", actor)).includes("Cobalt"));
  }
  assert.ok(s.read("luxtria", alice, "public").body.includes("Cobalt"));
  assert.equal(s.read("luxtria", alice, "secret").backlinks[0].id, "public");
  assert.equal(
    s.previewCharacter("luxtria", gm, "bob", "secret").visible,
    false,
  );
  assert.equal(
    s.previewCharacter("luxtria", gm, "alice", "secret").visible,
    true,
  );
  forbidden(() => s.getDraft("luxtria", bob, "secret"), 403);
  forbidden(() => s.listCharacters("luxtria", alice), 403);
});

test("drafts preserve published content, reject stale edits and support explicit restore and withdrawal", (t) => {
  const { s, db, draft, publish } = fixture(t);
  draft("entry", undefined, { title: "Original" });
  publish("entry");
  draft("entry", undefined, { title: "Revised" }, 1);
  assert.equal(s.read("luxtria", null, "entry").title, "Original");
  forbidden(() => draft("entry", undefined, { title: "Stale" }, 1), 409);
  forbidden(() => publish("entry", 1), 409);
  publish("entry", 2);
  s.restore("luxtria", gm, "entry", {
    expectedVersion: 2,
    version: 1,
    mutationId: "restore",
  });
  assert.equal(s.read("luxtria", null, "entry").title, "Revised");
  assert.equal(s.getDraft("luxtria", gm, "entry").draft.version, 3);
  publish("entry", 3);
  assert.equal(s.read("luxtria", null, "entry").title, "Original");
  s.unpublish("luxtria", gm, "entry", {
    expectedVersion: 3,
    mutationId: "withdraw",
  });
  forbidden(() => s.read("luxtria", null, "entry"));
  assert.equal(s.search("luxtria", null).total, 0);
  assert.equal(s.getDraft("luxtria", gm, "entry").draft.title, "Original");
  assert.ok(db.prepare("SELECT COUNT(*) AS n FROM audit").get().n >= 7);
});

test("audience changes take effect only on publish and immediately remove a former recipient", (t) => {
  const { s, draft, publish } = fixture(t);
  draft("knowledge", {
    visibility: "characters",
    characterIds: ["alice", "bob"],
  });
  publish("knowledge");
  draft(
    "knowledge",
    { visibility: "characters", characterIds: ["alice"] },
    {},
    1,
  );
  assert.equal(s.read("luxtria", bob, "knowledge").id, "knowledge");
  publish("knowledge", 2);
  forbidden(() => s.read("luxtria", bob, "knowledge"));
  assert.equal(s.overview("luxtria", bob).unreadKnowledge, 0);
  assert.equal(s.overview("luxtria", alice).unreadKnowledge, 1);
  forbidden(
    () =>
      draft("unknown-recipient", {
        visibility: "characters",
        characterIds: ["missing"],
      }),
    400,
  );
  draft("gm-only", { visibility: "gm" });
  forbidden(() => publish("gm-only"), 400);
});

test("idempotent mutations and atomic batches retain no partial writes on conflict", (t) => {
  const { s, draft } = fixture(t);
  const input = {
    entry: { id: "retry", type: "lore", title: "Retry" },
    expectedVersion: 0,
    mutationId: "same-operation",
  };
  assert.deepEqual(
    s.write("luxtria", gm, input),
    s.write("luxtria", gm, input),
  );
  assert.equal(s.getDraft("luxtria", gm, "retry").draft.version, 1);
  forbidden(
    () =>
      s.write("luxtria", gm, {
        ...input,
        entry: { ...input.entry, title: "Different" },
      }),
    409,
  );
  draft("existing");
  const batch = {
    mutationId: "batch",
    entries: [
      {
        entry: { id: "new", type: "place", title: "New place" },
        expectedVersion: 0,
      },
      {
        entry: { id: "existing", type: "lore", title: "Conflict" },
        expectedVersion: 0,
      },
    ],
  };
  forbidden(() => s.importApply("luxtria", gm, batch), 409);
  forbidden(() => s.getDraft("luxtria", gm, "new"));
  batch.entries[1].expectedVersion = 1;
  const saved = s.importApply("luxtria", gm, batch);
  assert.equal(saved.saved, 2);
  assert.equal(saved.published, false);
  assert.deepEqual(s.importApply("luxtria", gm, batch), saved);
});

test("read status and saved entries belong to the character and publication version", (t) => {
  const { s, draft, publish } = fixture(t);
  draft("knowledge", {
    visibility: "characters",
    characterIds: ["alice", "bob"],
  });
  publish("knowledge");
  s.readerState("luxtria", alice, "knowledge", {
    read: true,
    bookmarked: true,
  });
  assert.equal(s.overview("luxtria", alice).unreadKnowledge, 0);
  assert.equal(s.overview("luxtria", bob).unreadKnowledge, 1);
  assert.equal(s.search("luxtria", alice, { bookmarked: "true" }).total, 1);
  assert.equal(s.search("luxtria", bob, { bookmarked: "true" }).total, 0);
  draft(
    "knowledge",
    { visibility: "characters", characterIds: ["alice", "bob"] },
    { body: "Updated knowledge" },
    1,
  );
  publish("knowledge", 2);
  assert.equal(s.overview("luxtria", alice).unreadKnowledge, 1);
  forbidden(
    () => s.readerState("luxtria", outsider, "knowledge", { read: true }),
    403,
  );
  forbidden(
    () =>
      s.saveCharacter("luxtria", gm, {
        characterId: "alice",
        characterName: "Alice",
        userSub: "bob-account",
      }),
    409,
  );
  forbidden(
    () =>
      s.saveCharacter("luxtria", gm, {
        characterId: "new-alice",
        characterName: "Alice",
        userSub: "alice-account",
      }),
    409,
  );
});

test("large library search is bounded, aliases and accents work, and unread counts are not page-limited", (t) => {
  const { s, draft, publish } = fixture(t);
  for (let i = 0; i < 65; i++) {
    draft(
      `note-${i}`,
      { visibility: "characters", characterIds: ["alice"] },
      {
        title: `City note ${i}`,
        aliases: ["Café Lantern"],
        type: i % 2 ? "place" : "lore",
      },
    );
    publish(`note-${i}`);
  }
  const first = s.search("luxtria", alice, { q: "cafe lan", limit: 12 });
  assert.equal(first.total, 65);
  assert.equal(first.items.length, 12);
  assert.equal(first.pages, 6);
  assert.equal(s.overview("luxtria", alice).unreadKnowledge, 65);
  assert.equal(s.search("luxtria", bob, { q: "cafe" }).total, 0);
  assert.equal(s.search("luxtria", alice, { q: '" OR * DROP' }).total, 0);
  assert.equal(s.search("luxtria", alice, { type: "place" }).total, 32);
  assert.equal(
    s.search("luxtria", alice, { page: 6, limit: 12 }).items.length,
    5,
  );
  forbidden(() => s.search("luxtria", alice, { limit: 100 }), 400);
  forbidden(() => s.search("other", alice), 404);
});

test("atlas keeps drafts and other characters’ places and lore out of every map payload", (t) => {
  const { s, draft, publish } = fixture(t);
  const location = {
    mapId: "luxtria",
    key: "hidden-door",
    type: "landmark",
    geometry: { type: "point", coordinates: [500, 600] },
  };
  draft(
    "hidden-door",
    { visibility: "characters", characterIds: ["alice"] },
    {
      type: "place",
      title: "Hidden door",
      summary: "A discreet entrance.",
      mapFeature: location,
    },
  );
  assert.equal(s.atlas("luxtria", alice, "luxtria").features.length, 16);
  publish("hidden-door");
  const secret = s
    .atlas("luxtria", alice, "luxtria")
    .features.find((f) => f.key === "hidden-door");
  assert.equal(secret.private, true);
  assert.equal(secret.entries[0].id, "hidden-door");
  for (const actor of [null, bob, outsider]) {
    const map = s.atlas("luxtria", actor, "luxtria");
    assert.equal(map.features.length, 16);
    assert.ok(!JSON.stringify(map).includes("hidden-door"));
    assert.equal(map.canEdit, false);
  }
  draft(
    "palace-secret",
    { visibility: "characters", characterIds: ["alice"] },
    {
      title: "Private palace clue",
      mapFeature: { ...location, key: "palace" },
    },
  );
  publish("palace-secret");
  assert.equal(
    s
      .atlas("luxtria", alice, "luxtria")
      .features.find((f) => f.key === "palace").entries.length,
    1,
  );
  assert.equal(
    s.atlas("luxtria", bob, "luxtria").features.find((f) => f.key === "palace")
      .entries.length,
    0,
  );
  assert.ok(
    !JSON.stringify(s.atlas("luxtria", alice, "luxtria")).includes(
      "characterIds",
    ),
  );
  s.unpublish("luxtria", gm, "hidden-door", {
    expectedVersion: 1,
    mutationId: "withdraw-map",
  });
  assert.equal(s.atlas("luxtria", alice, "luxtria").features.length, 16);
  forbidden(() => s.atlas("luxtria", alice, "unknown"));
});
test("atlas placements reject invalid geometry and zoom ranges before saving", (t) => {
  const { draft } = fixture(t);
  const base = {
    mapId: "luxtria",
    key: "invalid",
    type: "district",
    geometry: {
      type: "polygon",
      coordinates: [
        [0, 0],
        [10, 10],
        [20, 0],
      ],
    },
  };
  for (const mapFeature of [
    {
      ...base,
      geometry: {
        type: "polygon",
        coordinates: [
          [0, 0],
          [10, 10],
        ],
      },
    },
    { ...base, geometry: { type: "point", coordinates: [-1, 0] } },
    {
      ...base,
      geometry: {
        type: "rectangle",
        bounds: [
          [20, 20],
          [10, 10],
        ],
      },
    },
    { ...base, minZoom: 2, maxZoom: 0 },
    { ...base, mapId: "other" },
  ])
    forbidden(() => draft("invalid", undefined, { mapFeature }), 400);
});

test("map ranges validate inherited limits and type defaults, and null can clear a limit", (t) => {
  const { s, draft, publish, db } = fixture(t);
  const palace = {
    mapId: "luxtria",
    key: "palace",
    type: "landmark",
    geometry: { type: "point", coordinates: [627, 627] },
  };
  forbidden(
    () =>
      draft("bad-palace", undefined, {
        type: "place",
        mapFeature: { ...palace, minZoom: 1 },
      }),
    400,
  );
  forbidden(
    () =>
      draft("bad-street", undefined, {
        type: "place",
        mapFeature: {
          ...palace,
          key: "new-street",
          type: "street",
          maxZoom: 0,
        },
      }),
    400,
  );
  draft("palace-first", undefined, {
    type: "place",
    mapFeature: { ...palace, minZoom: 1, maxZoom: 2 },
  });
  publish("palace-first");
  draft("palace-second", undefined, {
    type: "place",
    mapFeature: { ...palace, maxZoom: -1 },
  });
  publish("palace-second");
  const feature = s
    .atlas("luxtria", null, "luxtria")
    .features.find((f) => f.key === "palace");
  assert.equal(feature.minZoom, -2); // Inherits the artwork, not the first entry's minZoom: 1.
  assert.equal(feature.maxZoom, -1);
  draft("cleared-limit", undefined, {
    type: "place",
    mapFeature: {
      ...palace,
      key: "cleared-street",
      type: "street",
      minZoom: null,
      maxZoom: 0,
    },
  });
  publish("cleared-limit");
  const cleared = s
    .atlas("luxtria", null, "luxtria")
    .features.find((f) => f.key === "cleared-street");
  assert.equal(cleared.minZoom, null);
  assert.equal(cleared.maxZoom, 0);
  // Simulate a draft saved by the old release; publication must also reject it.
  draft("old-draft", undefined, { type: "place", mapFeature: palace });
  const old = JSON.parse(
    db.prepare("SELECT draft FROM entries WHERE id = ?").get("old-draft").draft,
  );
  old.mapFeature.minZoom = 1;
  db.prepare("UPDATE entries SET draft = ? WHERE id = ?").run(
    JSON.stringify(old),
    "old-draft",
  );
  forbidden(() => publish("old-draft"), 400);
  assert.equal(
    db.prepare("SELECT published FROM entries WHERE id = ?").get("old-draft")
      .published,
    null,
  );
});
