import test from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createLuxtriaMcp } from "./server.mjs";
import { createCampaignApp } from "../campaign/app.mjs";
import { createStore } from "../campaign/store.mjs";
import { createCampaignService } from "../campaign/service.mjs";
import { CampaignError } from "../campaign/service.mjs";

const token = "test-key-".repeat(8);
test("MCP and HTTP complete draft, exact audience, preview, publish, read, edit, restore and withdrawal", async (t) => {
  const db = createStore();
  const service = createCampaignService(db);
  const auth = async (header) => {
    if (!header) return { sub: null, gm: false };
    if (header === `Bearer ${token}`) return { sub: "gm-test", gm: true };
    if (header === "Bearer alice") return { sub: "alice-account", gm: false };
    if (header === "Bearer bob") return { sub: "bob-account", gm: false };
    throw new CampaignError(401, "Invalid token");
  };
  const http = createCampaignApp(service, auth, {
    allowedOrigin: "https://campaign.example",
  }).listen(0, "127.0.0.1");
  await once(http, "listening");
  const base = `http://127.0.0.1:${http.address().port}`;
  const mcp = createLuxtriaMcp({ apiUrl: base, token });
  const client = new Client({ name: "integration-test", version: "1" });
  const [clientTransport, serverTransport] =
    InMemoryTransport.createLinkedPair();
  t.after(async () => {
    await client.close();
    await mcp.close();
    await new Promise((resolve) => http.close(resolve));
    db.close();
  });
  await mcp.connect(serverTransport);
  await client.connect(clientTransport);
  const call = async (name, args) => {
    const result = await client.callTool({ name, arguments: args });
    assert.ok(!result.isError, result.content?.[0]?.text);
    return result.structuredContent.data;
  };
  const tools = await client.listTools();
  assert.ok(
    tools.tools.some((tool) => tool.name === "preview_obsidian_import"),
  );
  for (const name of ["alice", "bob"])
    await call("register_campaign_character", {
      character: {
        characterId: name,
        characterName: name,
        userSub: `${name}-account`,
      },
    });
  const entry = {
    id: "oath",
    type: "secret",
    title: "Secret oath",
    body: "Only Alice knows this.",
    aliases: ["Promise"],
    sourceMetadata: { canon: "canon", hiddenTruth: "Do not show" },
    intelligence: {
      learnedFrom: "Your mentor",
      acquired: "Before session one",
      evidence: "A signed oath",
    },
    mapFeature: {
      mapId: "luxtria",
      key: "oath-pin",
      type: "landmark",
      geometry: { type: "point", coordinates: [100, 100] },
    },
  };
  const created = await call("create_entry_draft", {
    entry,
    mutationId: "create",
  });
  assert.equal(created.audience.visibility, "gm");
  assert.equal(
    (await fetch(`${base}/api/campaigns/luxtria/entries`)).status,
    200,
  );
  assert.equal(
    (await (await fetch(`${base}/api/campaigns/luxtria/entries`)).json()).total,
    0,
  );
  await call("set_draft_audience", {
    entryId: "oath",
    audience: { visibility: "characters", characterIds: ["alice"] },
    expectedVersion: 1,
    mutationId: "audience",
  });
  const preview = await call("preview_change", { entryId: "oath" });
  assert.deepEqual(
    preview.recipients.map((item) => item.characterId),
    ["alice"],
  );
  assert.equal(
    (
      await call("preview_character_view", {
        entryId: "oath",
        characterId: "bob",
      })
    ).visible,
    false,
  );
  await call("publish_change", {
    entryId: "oath",
    expectedVersion: 2,
    mutationId: "publish",
  });
  assert.ok(
    (await call("get_campaign_map", {})).features.some(
      (feature) => feature.key === "oath-pin",
    ),
  );
  for (const [actor, count] of [
    ["alice", 17],
    ["bob", 16],
    [null, 16],
  ]) {
    const response = await fetch(`${base}/api/campaigns/luxtria/maps/luxtria`, {
      headers: actor ? { Authorization: `Bearer ${actor}` } : {},
    });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("cache-control"), "private, no-store");
    const atlas = await response.json();
    assert.equal(atlas.features.length, count);
    if (actor !== "alice")
      assert.ok(!JSON.stringify(atlas).includes("oath-pin"));
  }
  const alice = await fetch(`${base}/api/campaigns/luxtria/entries/oath`, {
    headers: {
      Authorization: "Bearer alice",
      Origin: "https://campaign.example",
    },
  });
  assert.equal(alice.status, 200);
  assert.equal(alice.headers.get("cache-control"), "private, no-store");
  assert.equal(
    alice.headers.get("access-control-allow-origin"),
    "https://campaign.example",
  );
  const safe = await alice.json();
  assert.equal(safe.body, entry.body);
  assert.deepEqual(safe.intelligence, entry.intelligence);
  assert.equal(safe.type, "secret");
  assert.ok(!("audience" in safe));
  assert.ok(!("sourceMetadata" in safe));
  for (const headers of [{}, { Authorization: "Bearer bob" }]) {
    const response = await fetch(`${base}/api/campaigns/luxtria/entries/oath`, {
      headers,
    });
    assert.equal(response.status, 404);
    assert.deepEqual(await response.json(), { message: "Entry not found." });
  }
  const denied = await fetch(`${base}/api/campaigns/luxtria/gm/entries`, {
    headers: { Authorization: "Bearer bob" },
  });
  assert.equal(denied.status, 403);
  const invalid = await fetch(`${base}/api/campaigns/luxtria/entries`, {
    headers: { Authorization: "Bearer forged" },
  });
  assert.equal(invalid.status, 401);
  await call("update_entry_draft", {
    entryId: "oath",
    patch: { title: "Changed oath" },
    expectedVersion: 2,
    mutationId: "patch",
  });
  const current = await call("get_entry", { entryId: "oath" });
  assert.equal(current.draft.body, entry.body);
  assert.deepEqual(current.draft.intelligence, entry.intelligence);
  assert.deepEqual(current.draft.aliases, ["Promise"]);
  assert.deepEqual(current.draft.audience.characterIds, ["alice"]);
  assert.equal(current.published.title, "Secret oath");
  const stale = await client.callTool({
    name: "publish_change",
    arguments: { entryId: "oath", expectedVersion: 2, mutationId: "stale" },
  });
  assert.equal(stale.isError, true);
  await call("publish_change", {
    entryId: "oath",
    expectedVersion: 3,
    mutationId: "publish-updated",
  });
  await call("restore_entry_version", {
    entryId: "oath",
    version: 2,
    expectedVersion: 3,
    mutationId: "restore",
  });
  assert.equal(
    (await call("get_entry", { entryId: "oath" })).published.title,
    "Changed oath",
  );
  await call("unpublish_entry", {
    entryId: "oath",
    expectedVersion: 4,
    mutationId: "withdraw",
  });
  assert.equal(
    (
      await fetch(`${base}/api/campaigns/luxtria/entries/oath`, {
        headers: { Authorization: "Bearer alice" },
      })
    ).status,
    404,
  );
});

test("MCP rejects unsafe remote URLs and missing GM credentials", async (t) => {
  assert.throws(() =>
    createLuxtriaMcp({ apiUrl: "http://untrusted.example", token }),
  );
  assert.throws(() =>
    createLuxtriaMcp({
      apiUrl: "https://user:password@campaign.example",
      token,
    }),
  );
  const server = createLuxtriaMcp({ token: "" });
  const client = new Client({ name: "test", version: "1" });
  const [a, b] = InMemoryTransport.createLinkedPair();
  t.after(async () => {
    await client.close();
    await server.close();
  });
  await server.connect(b);
  await client.connect(a);
  const result = await client.callTool({
    name: "list_entry_drafts",
    arguments: {},
  });
  assert.equal(result.isError, true);
  assert.ok(result.content[0].text.includes("LUXTRIA_GM_TOKEN"));
});

test("Obsidian MCP bounds file reads and rejects changed content between preview and import", async (t) => {
  const { mkdtemp, writeFile, rm, mkdir } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const root = await mkdtemp(join(tmpdir(), "luxtria-mcp-vault-"));
  const allowed = join(root, "Campaign");
  await mkdir(allowed);
  await writeFile(join(allowed, "Guide.md"), "# Guide\n\nPlayer-facing draft.");
  await writeFile(join(root, "outside.md"), "Outside the selected root.");
  const submitted = [];
  const server = createLuxtriaMcp({
    token,
    vaultPath: allowed,
    fetcher: async (_url, options) => {
      const input = JSON.parse(options.body);
      submitted.push(input);
      return Response.json({
        saved: input.entries.length,
        items: input.entries.map(({ entry }) => ({ ...entry, version: 1 })),
        published: false,
      });
    },
  });
  const client = new Client({ name: "test", version: "1" });
  const [a, b] = InMemoryTransport.createLinkedPair();
  t.after(async () => {
    await client.close();
    await server.close();
    await rm(root, { recursive: true, force: true });
  });
  await server.connect(b);
  await client.connect(a);
  const preview = await client.callTool({
    name: "preview_obsidian_import",
    arguments: {},
  });
  assert.ok(!preview.isError);
  const data = preview.structuredContent.data;
  assert.equal(data.total, 1);
  const outside = await client.callTool({
    name: "preview_obsidian_import",
    arguments: { subdirectory: ".." },
  });
  assert.equal(outside.isError, true);
  assert.ok(outside.content[0].text.includes("outside"));
  const imported = await client.callTool({
    name: "import_obsidian_drafts",
    arguments: { digest: data.digest, mutationId: "reviewed-import" },
  });
  assert.ok(!imported.isError);
  assert.equal(imported.structuredContent.data.published, false);
  assert.equal(submitted[0].entries[0].entry.audience.visibility, "gm");
  assert.equal(submitted[0].entries[0].expectedVersion, 0);
  await writeFile(
    join(allowed, "Guide.md"),
    "# Guide\n\nChanged while being reviewed.",
  );
  const stale = await client.callTool({
    name: "import_obsidian_drafts",
    arguments: { digest: data.digest, mutationId: "stale-import" },
  });
  assert.equal(stale.isError, true);
  assert.equal(submitted.length, 1);
});
