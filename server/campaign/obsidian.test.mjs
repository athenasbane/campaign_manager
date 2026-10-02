import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, symlink, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseObsidianNote, prepareObsidianImport } from "./obsidian.mjs";

test("frontmatter retains DM-only and non-canon intent and titles do not come from later headings", () => {
  const note = parseObsidianNote(
    "---\nlore_include: false\nlore_audience: dm\ncanon: non-canon\naliases: [The Ring]\n---\nCity guide\n\n## Government\nDetails.",
    "Player Guide/01 City.md",
  );
  assert.equal(note.title, "City guide");
  assert.equal(note.sourceMetadata.lore_include, false);
  assert.equal(note.sourceMetadata.canon, "non-canon");
  assert.equal(note.audience.visibility, "gm");
  assert.ok(!note.body.startsWith("City guide"));
  assert.ok(note.aliases.includes("The Ring"));
  assert.equal(
    parseObsidianNote("# City\n\n## Gate\nDetails", "City.md").body,
    "## Gate\nDetails",
  );
  assert.equal(
    note.id,
    parseObsidianNote("Changed text", "Player Guide/01 City.md").id,
  );
});

test("bounded import resolves unique links, reports ambiguities, excludes symlinks and never publishes", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "luxtria-obsidian-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, "Places"));
  await mkdir(join(root, "Other"));
  await mkdir(join(root, ".obsidian"));
  await writeFile(join(root, "Places", "Gate.md"), "# Gate\n\nThe way in.");
  await writeFile(
    join(root, "Other", "Gate.md"),
    "# Gate\n\nA different gate.",
  );
  await writeFile(
    join(root, "Index.md"),
    "# Index\n\n[[Places/Gate|Known gate]] [[Gate]] [[Missing]] ![[private.png]] ![map](private/map.png)",
  );
  await writeFile(join(root, ".obsidian", "hidden.md"), "Hidden");
  await symlink(join(root, "Places", "Gate.md"), join(root, "linked.md"));
  const result = await prepareObsidianImport(root);
  assert.equal(result.total, 3);
  assert.equal(result.published, false);
  assert.equal(result.skipped.length, 1);
  assert.ok(
    result.entries.every((entry) => entry.audience.visibility === "gm"),
  );
  const index = result.entries.find((entry) => entry.title === "Index");
  const gate = result.entries.find(
    (entry) => entry.source === "Places/Gate.md",
  );
  assert.deepEqual(index.relatedIds, [gate.id]);
  assert.ok(index.body.includes(`/world/${gate.id}`));
  assert.equal(result.warnings.length, 4);
  assert.ok(result.duplicateTitles.some((item) => item.title === "gate"));
  assert.ok(!index.body.includes("private/map.png"));
});
