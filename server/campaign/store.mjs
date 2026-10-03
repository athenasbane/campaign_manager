import { DatabaseSync } from "node:sqlite";
import { mkdirSync, chmodSync } from "node:fs";
import { dirname } from "node:path";

export function createStore(path = ":memory:") {
  if (path !== ":memory:")
    mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
  const db = new DatabaseSync(path);
  if (path !== ":memory:") chmodSync(path, 0o600);
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    PRAGMA busy_timeout = 5000;
    CREATE TABLE IF NOT EXISTS campaigns (id TEXT PRIMARY KEY, data TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS members (
      campaign TEXT NOT NULL, character_id TEXT NOT NULL, user_sub TEXT NOT NULL,
      data TEXT NOT NULL, PRIMARY KEY (campaign, character_id), UNIQUE (campaign, user_sub)
    );
    CREATE TABLE IF NOT EXISTS entries (
      campaign TEXT NOT NULL, id TEXT NOT NULL, version INTEGER NOT NULL,
      draft TEXT NOT NULL, published TEXT, updated_at TEXT NOT NULL,
      PRIMARY KEY (campaign, id)
    );
    CREATE TABLE IF NOT EXISTS revisions (
      campaign TEXT NOT NULL, id TEXT NOT NULL, version INTEGER NOT NULL,
      data TEXT NOT NULL, PRIMARY KEY (campaign, id, version)
    );
    CREATE TABLE IF NOT EXISTS mutations (
      campaign TEXT NOT NULL, id TEXT NOT NULL, fingerprint TEXT NOT NULL,
      result TEXT NOT NULL, PRIMARY KEY (campaign, id)
    );
    CREATE TABLE IF NOT EXISTS audit (
      sequence INTEGER PRIMARY KEY AUTOINCREMENT, campaign TEXT NOT NULL,
      actor TEXT NOT NULL, action TEXT NOT NULL, entry_id TEXT,
      at TEXT NOT NULL, details TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS read_state (
      campaign TEXT NOT NULL, character_id TEXT NOT NULL, entry_id TEXT NOT NULL,
      version INTEGER NOT NULL, bookmarked INTEGER NOT NULL DEFAULT 0,
      personal_notes TEXT NOT NULL DEFAULT '',
      PRIMARY KEY (campaign, character_id, entry_id)
    );
    CREATE VIRTUAL TABLE IF NOT EXISTS entry_search USING fts5(
      campaign UNINDEXED, id UNINDEXED, title, aliases, summary, body, tags,
      tokenize='unicode61 remove_diacritics 2'
    );
  `);
  // Existing local databases gain notes without replacing reading history.
  if (
    !db
      .prepare("PRAGMA table_info(read_state)")
      .all()
      .some((column) => column.name === "personal_notes")
  ) {
    db.exec(
      "ALTER TABLE read_state ADD COLUMN personal_notes TEXT NOT NULL DEFAULT ''",
    );
  }
  db.prepare("INSERT OR IGNORE INTO campaigns (id, data) VALUES (?, ?)").run(
    "luxtria",
    JSON.stringify({
      id: "luxtria",
      name: "Luxtria",
      description: "A new chapter in Teratin.",
      nextSession: null,
      timezone: "Europe/London",
      primerId: null,
    }),
  );
  return db;
}
