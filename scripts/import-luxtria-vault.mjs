import "../server/campaign/env.mjs";
import { resolve } from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { isDeepStrictEqual } from "node:util";
import { createStore } from "../server/campaign/store.mjs";
import { createCampaignService } from "../server/campaign/service.mjs";
import { prepareObsidianImport } from "../server/campaign/obsidian.mjs";

const path = process.argv[2] || process.env.LUXTRIA_VAULT_PATH;
if (!path)
  throw new Error(
    "Supply the Obsidian campaign directory or set LUXTRIA_VAULT_PATH.",
  );
const prepared = await prepareObsidianImport(path);
const db = createStore(
  resolve(process.env.LUXTRIA_DB_PATH || ".local/luxtria.sqlite"),
);
const service = createCampaignService(db);
const actor = { sub: "gm:local-import", gm: true };
let saved = 0;
const unchanged = [];
const conflicts = [];
for (let offset = 0; offset < prepared.entries.length; offset += 20) {
  const pending = prepared.entries
    .slice(offset, offset + 20)
    .flatMap((entry) => {
      try {
        const prior = service.getDraft("luxtria", actor, entry.id);
        const {
          version: _version,
          updatedAt: _updatedAt,
          ...existing
        } = prior.draft;
        if (isDeepStrictEqual(existing, entry)) unchanged.push(entry.id);
        else
          conflicts.push({
            id: entry.id,
            source: entry.source,
            reason:
              "Existing draft differs; update through MCP with its expected version.",
          });
        return [];
      } catch (error) {
        if (error.status !== 404) throw error;
        return [{ entry, expectedVersion: 0 }];
      }
    });
  if (!pending.length) continue;
  const digest = createHash("sha256")
    .update(JSON.stringify(pending))
    .digest("hex");
  saved += service.importApply("luxtria", actor, {
    entries: pending,
    mutationId: `obsidian-${digest}`,
  }).saved;
}
await mkdir(".local", { recursive: true, mode: 0o700 });
const report = {
  total: prepared.total,
  saved,
  unchanged: unchanged.length,
  published: 0,
  conflicts,
  warnings: prepared.warnings,
  skipped: prepared.skipped,
  duplicateTitles: prepared.duplicateTitles,
  entries: prepared.entries.map(({ id, title, source, sourceMetadata }) => ({
    id,
    title,
    source,
    sourceMetadata,
  })),
};
await writeFile(
  ".local/obsidian-import-report.json",
  JSON.stringify(report, null, 2),
  { mode: 0o600 },
);
const lines = [
  "# Luxtria Obsidian import review",
  "",
  `Reviewed ${prepared.total} vault notes. Saved ${saved} new GM-only drafts; ${unchanged.length} were unchanged. Nothing was published by this import.`,
  "",
  "Select the notes you want players to see, then assign party or exact character visibility and publish through MCP. Source frontmatter is preserved. DM-only and non-canon flags are review warnings, never automatic publishing instructions.",
  "",
  "| Note | Source folder | Source audience | Canon | Entry ID |",
  "| --- | --- | --- | --- | --- |",
  ...report.entries.map(
    (entry) =>
      `| ${entry.title.replace(/\|/g, "\\|")} | ${entry.source.split("/").slice(0, -1).join("/")} | ${entry.sourceMetadata.lore_audience || entry.sourceMetadata.knowledge || "Unspecified"} | ${entry.sourceMetadata.canon || "Unspecified"} | ${entry.id} |`,
  ),
  "",
  `Link/attachment warnings: ${report.warnings.length}. Possible duplicate names: ${report.duplicateTitles.length}. Skipped notes: ${report.skipped.length}. Conflicting updates: ${conflicts.length}.`,
  "",
  "Detailed warnings are in obsidian-import-report.json. Neither report is committed to the repository.",
];
await writeFile(".local/obsidian-import-review.md", lines.join("\n") + "\n", {
  mode: 0o600,
});
db.close();
console.log(
  JSON.stringify({
    notes: prepared.total,
    saved,
    unchanged: unchanged.length,
    published: 0,
    warnings: prepared.warnings.length,
    conflicts: conflicts.length,
    report: ".local/obsidian-import-review.md",
  }),
);
