import { readFile, readdir, realpath, stat } from "node:fs/promises";
import { resolve, relative, basename, dirname, sep } from "node:path";
import { createHash } from "node:crypto";
import { parse as parseYaml } from "yaml";

const slug = (value) =>
  value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64) || "note";
const list = (value) =>
  Array.isArray(value)
    ? value.map(String)
    : typeof value === "string"
      ? [value]
      : [];
export function parseObsidianNote(text, path) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(
    text.replace(/^\uFEFF/, ""),
  );
  const metadata = match ? parseYaml(match[1]) || {} : {};
  if (typeof metadata !== "object" || Array.isArray(metadata))
    throw new Error(`Invalid frontmatter: ${path}`);
  let body = (
    match ? text.replace(/^\uFEFF/, "").slice(match[0].length) : text
  ).trim();
  const heading = /^#\s+(.+)/.exec(body)?.[1];
  const firstLine = body.split(/\r?\n/)[0];
  const plainTitle =
    /^[\p{L}]/u.test(firstLine) &&
    !firstLine.includes("|") &&
    firstLine.length < 150;
  const title = String(
    metadata.title ||
      heading ||
      (plainTitle ? firstLine : basename(path, ".md").replace(/^\d+\s+/, "")),
  ).trim();
  if (firstLine === title || firstLine === `# ${title}`)
    body = body.slice(firstLine.length).trim();
  const id = `obs-${slug(basename(path, ".md"))}-${createHash("sha256").update(path).digest("hex").slice(0, 10)}`;
  const folder = path.split("/")[0];
  const rawType = String(
    metadata.lux_type || metadata.type || "",
  ).toLowerCase();
  const type =
    rawType.includes("npc") ||
    rawType === "person" ||
    path.split("/").includes("NPCs")
      ? "person"
      : rawType.includes("place") || path.split("/").includes("Locations")
        ? "place"
        : rawType.includes("faction")
          ? "faction"
          : "lore";
  const sourceMetadata = Object.fromEntries(
    Object.entries(metadata).filter(
      ([, value]) =>
        ["string", "boolean", "number"].includes(typeof value) ||
        (Array.isArray(value) &&
          value.every((item) => typeof item === "string")),
    ),
  );
  return {
    id,
    title,
    type,
    body,
    aliases: [
      ...new Set([...list(metadata.aliases), basename(path, ".md")]),
    ].slice(0, 30),
    summary: "",
    tags: [...new Set([folder, ...list(metadata.tags)])].slice(0, 30),
    source: path,
    sourceMetadata,
    relatedIds: [],
    audience: { visibility: "gm", characterIds: [] },
  };
}

// Only reads Markdown inside the selected root. Symlinks and vault configuration are excluded.
export async function prepareObsidianImport(directory) {
  const root = await realpath(directory);
  const files = [];
  const skipped = [];
  async function walk(path) {
    for (const file of await readdir(path, { withFileTypes: true })) {
      if (file.name.startsWith(".")) continue;
      const location = resolve(path, file.name);
      if (file.isSymbolicLink()) {
        skipped.push({
          path: relative(root, location),
          reason: "Symlink excluded",
        });
        continue;
      }
      if (file.isDirectory()) await walk(location);
      else if (file.name.toLowerCase().endsWith(".md")) files.push(location);
    }
  }
  await walk(root);
  if (files.length > 10000)
    throw new Error("Import at most 10,000 notes at a time.");
  const entries = [];
  for (const file of files.sort()) {
    const path = relative(root, file).split(sep).join("/");
    if (relative(root, await realpath(file)).startsWith(".."))
      throw new Error("Note resolves outside the selected vault.");
    if ((await stat(file)).size > 1000000) {
      skipped.push({ path, reason: "Note exceeds 1 MB" });
      continue;
    }
    try {
      entries.push(parseObsidianNote(await readFile(file, "utf8"), path));
    } catch (error) {
      skipped.push({ path, reason: error.message });
    }
  }
  const byPath = new Map(
    entries.map((entry) => [
      entry.source.replace(/\.md$/i, "").toLowerCase(),
      entry,
    ]),
  );
  const candidates = new Map();
  for (const entry of entries)
    for (const name of new Set([entry.title, ...entry.aliases])) {
      const key = name.toLowerCase();
      const matches = candidates.get(key) || [];
      matches.push(entry);
      candidates.set(key, matches);
    }
  const warnings = [];
  for (const entry of entries) {
    const refs = new Set();
    entry.body = entry.body.replace(
      /(!?)\[\[([^\]]+)\]\]/g,
      (_whole, embed, inside) => {
        const [rawTarget, label] = inside.split("|");
        const [note, anchor] = rawTarget.split("#");
        const target = note.replace(/\.md$/i, "").trim();
        if (embed) {
          warnings.push({
            source: entry.source,
            target: rawTarget,
            reason: "Embedded note or attachment requires review",
          });
          return `*${label || rawTarget} (attachment or embedded note)*`;
        }
        if (!target && anchor) return `[${label || anchor}](#${slug(anchor)})`;
        const direct =
          byPath.get(target.toLowerCase()) ||
          byPath.get(
            resolve("/", dirname(entry.source), target).slice(1).toLowerCase(),
          );
        const matches = candidates.get(target.toLowerCase()) || [];
        const related = direct || (matches.length === 1 ? matches[0] : null);
        if (!related) {
          warnings.push({
            source: entry.source,
            target,
            reason:
              matches.length > 1
                ? "Ambiguous note name"
                : "Note is outside this import or missing",
          });
          return label || target;
        }
        refs.add(related.id);
        return `[${(label || related.title).replace(/\]/g, "")}](/world/${related.id}${anchor ? `#${slug(anchor)}` : ""})`;
      },
    );
    entry.relatedIds = [...refs].filter((id) => id !== entry.id);
    // Do not put private vault attachment paths into web pages.
    entry.body = entry.body.replace(
      /!\[([^\]]*)\]\(([^)]+)\)/g,
      (_whole, label, target) => {
        warnings.push({
          source: entry.source,
          target,
          reason: "Image requires protected attachment import",
        });
        return `*${label || "Image"} (attachment)*`;
      },
    );
  }
  const duplicateTitles = [...candidates.entries()]
    .filter(([, values]) => values.length > 1)
    .map(([title, values]) => ({
      title,
      sources: values.map((entry) => entry.source),
    }));
  return {
    root,
    entries,
    warnings,
    skipped,
    duplicateTitles,
    total: entries.length,
    published: false,
  };
}
