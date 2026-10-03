import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createStore } from "./store.mjs";

test("existing SQLite reading history gains annotations without losing data", (t) => {
  const directory = mkdtempSync(join(tmpdir(), "luxtria-notes-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const file = join(directory, "campaign.sqlite");
  const legacy = new DatabaseSync(file);
  legacy.exec(
    "CREATE TABLE read_state (campaign TEXT, character_id TEXT, entry_id TEXT, version INTEGER, bookmarked INTEGER, PRIMARY KEY(campaign,character_id,entry_id)); INSERT INTO read_state VALUES ('luxtria','alice','note',2,1)",
  );
  legacy.close();
  let db = createStore(file);
  assert.deepEqual(
    { ...db.prepare("SELECT * FROM read_state").get() },
    {
      campaign: "luxtria",
      character_id: "alice",
      entry_id: "note",
      version: 2,
      bookmarked: 1,
      personal_notes: "",
    },
  );
  db.prepare("UPDATE read_state SET personal_notes = ?").run(
    "Keep this thought",
  );
  db.close();
  db = createStore(file);
  assert.equal(
    db.prepare("SELECT personal_notes FROM read_state").get().personal_notes,
    "Keep this thought",
  );
  db.close();
});
