import { createHash } from "node:crypto";
import { z } from "zod";
import luxtriaMap from "./luxtria-map.json" with { type: "json" };
import {
  campaignSchema,
  entrySchema,
  memberSchema,
  writeSchema,
  versionSchema,
  restoreSchema,
} from "./schemas.mjs";

export class CampaignError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
const fail = (status, message) => {
  throw new CampaignError(status, message);
};
const parse = (schema, value) => {
  const result = schema.safeParse(value);
  if (!result.success)
    fail(
      400,
      result.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; "),
    );
  return result.data;
};
const clean = (entry) => {
  const {
    audience: _audience,
    source: _source,
    sourceMetadata: _metadata,
    ...safe
  } = entry;
  return { ...safe, private: entry.audience.visibility === "characters" };
};
const summary = (entry) => {
  const { body: _body, relatedIds: _relations, ...safe } = clean(entry);
  return safe;
};

export const entrySearchBody = (entry) =>
  [
    entry.body.replace(/\[[^\]]*\]\(\/world\/[^)]+\)/g, ""),
    ...Object.values(entry.intelligence || {}),
  ].join(" ");

const defaultMapMinZoom = { district: 0, route: 1, street: 2 };
// Resolve every placement against stable artwork defaults, never another
// entry's audience-dependent overrides. Null explicitly removes a limit.
function mapZoomRange(location) {
  const original = luxtriaMap.features.find(
    (feature) => feature.key === location.key,
  );
  const minZoom =
    location.minZoom !== undefined
      ? location.minZoom
      : (original?.minZoom ?? defaultMapMinZoom[location.type] ?? null);
  const maxZoom =
    location.maxZoom !== undefined
      ? location.maxZoom
      : (original?.maxZoom ?? null);
  if (
    Math.max(minZoom ?? luxtriaMap.minZoom, luxtriaMap.minZoom) >
    Math.min(maxZoom ?? luxtriaMap.maxZoom, luxtriaMap.maxZoom)
  )
    fail(
      400,
      "Effective feature zoom range is empty. Set both limits or clear an inherited limit with null.",
    );
  return { minZoom, maxZoom };
}

export function createCampaignService(db) {
  const campaign = (id) => {
    const row = db.prepare("SELECT data FROM campaigns WHERE id = ?").get(id);
    if (!row) fail(404, "Campaign not found.");
    return JSON.parse(row.data);
  };
  const member = (id, actor) =>
    actor?.sub
      ? db
          .prepare(
            "SELECT data FROM members WHERE campaign = ? AND user_sub = ?",
          )
          .get(id, actor.sub)
      : null;
  const character = (id, actor) => {
    const row = member(id, actor);
    return row ? JSON.parse(row.data) : null;
  };
  const requireGm = (actor) => {
    if (!actor?.gm) fail(403, "GM access is required.");
  };
  const visible = (entry, id, actor) => {
    if (actor?.gm) return true;
    if (entry.audience.visibility === "public") return true;
    const own = character(id, actor);
    if (!own) return false;
    return (
      entry.audience.visibility === "party" ||
      (entry.audience.visibility === "characters" &&
        entry.audience.characterIds.includes(own.characterId))
    );
  };
  const record = (id, entryId) =>
    db
      .prepare("SELECT * FROM entries WHERE campaign = ? AND id = ?")
      .get(id, entryId);
  const published = (id, entryId, actor) => {
    const row = record(id, entryId);
    const entry = row?.published ? JSON.parse(row.published) : null;
    if (!entry || !visible(entry, id, actor)) fail(404, "Entry not found.");
    return entry;
  };
  const permittedRelations = (id, entryIds, actor) =>
    entryIds.flatMap((entryId) => {
      const row = record(id, entryId);
      const entry = row?.published ? JSON.parse(row.published) : null;
      return entry && visible(entry, id, actor) ? [summary(entry)] : [];
    });
  const safeBody = (id, entry, actor) =>
    entry.body.replace(
      /\[([^\]]*)\]\(\/world\/([a-zA-Z0-9_-]+)(?:#[^)]*)?\)/g,
      (link, _label, entryId) =>
        permittedRelations(id, [entryId], actor).length ? link : "",
    );
  const audienceValid = (id, audience) => {
    for (const recipient of audience.characterIds) {
      if (
        !db
          .prepare(
            "SELECT 1 FROM members WHERE campaign = ? AND character_id = ?",
          )
          .get(id, recipient)
      )
        fail(400, `Unknown character: ${recipient}`);
    }
  };
  const audit = (id, actor, action, entryId, details = {}) =>
    db
      .prepare(
        "INSERT INTO audit (campaign, actor, action, entry_id, at, details) VALUES (?, ?, ?, ?, ?, ?)",
      )
      .run(
        id,
        actor.sub,
        action,
        entryId,
        new Date().toISOString(),
        JSON.stringify(details),
      );
  const mutate = (id, actor, mutationId, input, work) => {
    requireGm(actor);
    campaign(id);
    const fingerprint = createHash("sha256")
      .update(JSON.stringify({ actor: actor.sub, input }))
      .digest("hex");
    db.exec("BEGIN IMMEDIATE");
    try {
      const prior = db
        .prepare(
          "SELECT fingerprint, result FROM mutations WHERE campaign = ? AND id = ?",
        )
        .get(id, mutationId);
      if (prior) {
        if (prior.fingerprint !== fingerprint)
          fail(409, "Mutation ID was already used for a different operation.");
        db.exec("COMMIT");
        return JSON.parse(prior.result);
      }
      const result = work();
      db.prepare("INSERT INTO mutations VALUES (?, ?, ?, ?)").run(
        id,
        mutationId,
        fingerprint,
        JSON.stringify(result),
      );
      db.exec("COMMIT");
      return result;
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  };
  const validateMapPlacement = (id, entry) => {
    if (entry.mapFeature) {
      const location = entry.mapFeature;
      if (id !== "luxtria" || location.mapId !== "luxtria")
        fail(400, "Unknown campaign map.");
      const geometry = location.geometry;
      const points =
        geometry.type === "point"
          ? [geometry.coordinates]
          : geometry.type === "rectangle"
            ? geometry.bounds
            : geometry.coordinates;
      if (
        points.some(
          ([x, y]) =>
            x < 0 ||
            y < 0 ||
            x > luxtriaMap.imageWidth ||
            y > luxtriaMap.imageHeight,
        )
      )
        fail(400, "Map coordinates are outside the artwork bounds.");
      if (
        (location.minZoom != null && location.minZoom > luxtriaMap.maxZoom) ||
        (location.maxZoom != null && location.maxZoom < luxtriaMap.minZoom)
      )
        fail(400, "Feature zoom range is outside the map's zoom range.");
      if (
        geometry.type === "rectangle" &&
        (geometry.bounds[0][0] >= geometry.bounds[1][0] ||
          geometry.bounds[0][1] >= geometry.bounds[1][1])
      )
        fail(400, "Draw a rectangle with a positive width and height.");
    }
    if (entry.mapFeature) mapZoomRange(entry.mapFeature);
  };
  const saveDraft = (id, actor, entry, expectedVersion, action = "draft") => {
    audienceValid(id, entry.audience);
    validateMapPlacement(id, entry);
    const prior = record(id, entry.id);
    if ((prior?.version || 0) !== expectedVersion)
      fail(409, "This entry changed. Read its latest version before updating.");
    const next = {
      ...entry,
      version: expectedVersion + 1,
      updatedAt: new Date().toISOString(),
    };
    db.prepare(
      `INSERT INTO entries (campaign, id, version, draft, updated_at) VALUES (?, ?, ?, ?, ?)
      ON CONFLICT (campaign, id) DO UPDATE SET version = excluded.version, draft = excluded.draft, updated_at = excluded.updated_at`,
    ).run(id, entry.id, next.version, JSON.stringify(next), next.updatedAt);
    db.prepare("INSERT INTO revisions VALUES (?, ?, ?, ?)").run(
      id,
      next.id,
      next.version,
      JSON.stringify(next),
    );
    audit(id, actor, action, next.id, {
      version: next.version,
      audience: next.audience,
    });
    return next;
  };
  const search = (id, actor, query = {}) => {
    campaign(id);
    const parsed = parse(
      z.object({
        q: z.string().max(200).default(""),
        type: z.string().max(100).default(""),
        page: z.coerce.number().int().min(1).max(100000).default(1),
        limit: z.coerce.number().int().min(1).max(50).default(12),
        privateOnly: z.enum(["true", "false"]).default("false"),
        bookmarked: z.enum(["true", "false"]).default("false"),
        unread: z.enum(["true", "false"]).default("false"),
        dossier: z.enum(["true", "false"]).default("false"),
      }),
      query,
    );
    const tokens = parsed.q.normalize("NFKC").match(/[\p{L}\p{N}_]+/gu) || [];
    const match = tokens
      .slice(0, 20)
      .map((token) => `"${token}"*`)
      .join(" AND ");
    const rows = match
      ? db
          .prepare(
            `SELECT entries.published FROM entry_search JOIN entries
      ON entries.campaign = entry_search.campaign AND entries.id = entry_search.id
      WHERE entry_search MATCH ? AND entries.campaign = ? ORDER BY rank`,
          )
          .all(match, id)
      : db
          .prepare(
            "SELECT published FROM entries WHERE campaign = ? AND published IS NOT NULL ORDER BY updated_at DESC, id",
          )
          .all(id);
    const own = character(id, actor);
    const states = own
      ? new Map(
          db
            .prepare(
              "SELECT * FROM read_state WHERE campaign = ? AND character_id = ?",
            )
            .all(id, own.characterId)
            .map((state) => [state.entry_id, state]),
        )
      : new Map();
    const entries = rows
      .map((row) => JSON.parse(row.published))
      .filter((entry) => visible(entry, id, actor));
    const types = Object.fromEntries(
      [...new Set(entries.map((entry) => entry.type))].map((type) => [
        type,
        entries.filter((entry) => entry.type === type).length,
      ]),
    );
    const filtered = entries.filter(
      (entry) =>
        (!parsed.type || parsed.type.split(",").includes(entry.type)) &&
        (parsed.privateOnly !== "true" ||
          entry.audience.visibility === "characters") &&
        (parsed.bookmarked !== "true" || states.get(entry.id)?.bookmarked) &&
        (parsed.unread !== "true" ||
          (own && (states.get(entry.id)?.version || 0) < entry.version)) &&
        (parsed.dossier !== "true" ||
          entry.audience.visibility === "characters" ||
          (entry.audience.visibility === "party" &&
            ["rumour", "secret", "knowledge", "handout"].includes(entry.type))),
    );
    if (parsed.dossier === "true" && own) {
      // Bring new slips forward without inventing a last-session date.
      filtered.sort(
        (a, b) =>
          Number((states.get(b.id)?.version || 0) < b.version) -
          Number((states.get(a.id)?.version || 0) < a.version),
      );
    }
    const start = (parsed.page - 1) * parsed.limit;
    return {
      items: filtered.slice(start, start + parsed.limit).map((entry) => ({
        ...summary(entry),
        relatedIds: permittedRelations(id, entry.relatedIds, actor).map(
          (related) => related.id,
        ),
        unread: own
          ? (states.get(entry.id)?.version || 0) < entry.version
          : false,
        bookmarked: Boolean(states.get(entry.id)?.bookmarked),
      })),
      total: filtered.length,
      unreadTotal: own
        ? filtered.filter(
            (entry) => (states.get(entry.id)?.version || 0) < entry.version,
          ).length
        : 0,
      page: parsed.page,
      pages: Math.ceil(filtered.length / parsed.limit),
      types,
    };
  };
  return {
    campaign,
    character,
    atlas(id, actor, mapId) {
      campaign(id);
      if (id !== "luxtria" || mapId !== "luxtria") fail(404, "Map not found.");
      const base = structuredClone(luxtriaMap);
      const features = new Map(
        base.features.map((feature) => [
          feature.key,
          { ...feature, private: false, entries: [] },
        ]),
      );
      const entries = db
        .prepare(
          "SELECT published FROM entries WHERE campaign = ? AND published IS NOT NULL ORDER BY updated_at, id",
        )
        .all(id)
        .map((row) => JSON.parse(row.published))
        .filter(
          (entry) =>
            visible(entry, id, actor) && entry.mapFeature?.mapId === mapId,
        );
      for (const entry of entries) {
        const location = entry.mapFeature;
        const existing = features.get(location.key);
        const related = {
          id: entry.id,
          title: entry.title,
          type: entry.type,
          private: entry.audience.visibility === "characters",
        };
        if (existing) {
          existing.entries.push(related);
          if (entry.type === "place")
            Object.assign(existing, {
              geometry: location.geometry,
              ...mapZoomRange(location),
            });
        } else {
          features.set(location.key, {
            key: location.key,
            name: entry.title,
            type: location.type,
            geometry: location.geometry,
            ...mapZoomRange(location),
            publicSummary: entry.summary,
            private: related.private,
            entries: [related],
          });
        }
      }
      return {
        ...base,
        features: [...features.values()],
        canEdit: Boolean(actor?.gm),
      };
    },
    overview(id, actor) {
      const data = campaign(id);
      const own = character(id, actor);
      const recent = search(id, actor, { limit: 6 });
      const sessions = search(id, actor, { type: "session", limit: 1 });
      const missions = search(id, actor, { type: "mission", limit: 3 });
      const secrets = own
        ? search(id, actor, { dossier: "true", limit: 1 })
        : { unreadTotal: 0 };
      const safePrimer = data.primerId
        ? permittedRelations(id, [data.primerId], actor)[0]
        : null;
      return {
        ...data,
        primerId: safePrimer?.id || null,
        member: own
          ? {
              characterId: own.characterId,
              characterName: own.characterName,
              displayName: own.displayName,
            }
          : null,
        total: recent.total,
        recent: recent.items,
        latestSession: sessions.items[0] || null,
        missions: missions.items,
        unreadKnowledge: secrets.unreadTotal,
      };
    },
    search,
    read(id, actor, entryId) {
      campaign(id);
      const entry = published(id, entryId, actor);
      const related = permittedRelations(id, entry.relatedIds, actor);
      const backlinks = db
        .prepare(
          "SELECT published FROM entries WHERE campaign = ? AND published IS NOT NULL",
        )
        .all(id)
        .map((row) => JSON.parse(row.published))
        .filter(
          (other) =>
            other.id !== entryId &&
            visible(other, id, actor) &&
            other.relatedIds.includes(entryId),
        )
        .map(summary);
      const own = character(id, actor);
      const state = own
        ? db
            .prepare(
              "SELECT * FROM read_state WHERE campaign = ? AND character_id = ? AND entry_id = ?",
            )
            .get(id, own.characterId, entryId)
        : null;
      return {
        ...clean(entry),
        body: safeBody(id, entry, actor),
        relatedIds: related.map((item) => item.id),
        related,
        backlinks,
        bookmarked: Boolean(state?.bookmarked),
        personalNotes: own ? state?.personal_notes || "" : "",
      };
    },
    readerState(id, actor, entryId, input) {
      const own = character(id, actor);
      if (!own) fail(403, "A campaign character is required.");
      const entry = published(id, entryId, actor);
      const value = parse(
        z
          .object({
            bookmarked: z.boolean().optional(),
            read: z.boolean().optional(),
            personalNotes: z.string().max(10000).optional(),
          })
          .strict(),
        input,
      );
      const prior = db
        .prepare(
          "SELECT * FROM read_state WHERE campaign = ? AND character_id = ? AND entry_id = ?",
        )
        .get(id, own.characterId, entryId);
      db.prepare(
        `INSERT INTO read_state (campaign, character_id, entry_id, version, bookmarked, personal_notes) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT (campaign, character_id, entry_id)
        DO UPDATE SET version = excluded.version, bookmarked = excluded.bookmarked, personal_notes = excluded.personal_notes`,
      ).run(
        id,
        own.characterId,
        entryId,
        value.read ? entry.version : prior?.version || 0,
        value.bookmarked === undefined
          ? prior?.bookmarked || 0
          : Number(value.bookmarked),
        value.personalNotes === undefined
          ? prior?.personal_notes || ""
          : value.personalNotes,
      );
      return { saved: true };
    },
    listCharacters(id, actor) {
      requireGm(actor);
      campaign(id);
      return db
        .prepare(
          "SELECT data FROM members WHERE campaign = ? ORDER BY character_id",
        )
        .all(id)
        .map((row) => JSON.parse(row.data));
    },
    saveCharacter(id, actor, input) {
      requireGm(actor);
      campaign(id);
      const data = parse(memberSchema, input);
      const previous = db
        .prepare(
          "SELECT user_sub FROM members WHERE campaign = ? AND character_id = ?",
        )
        .get(id, data.characterId);
      if (previous && previous.user_sub !== data.userSub)
        fail(
          409,
          "A character's account cannot be reassigned through this operation.",
        );
      const existingUser = member(id, { sub: data.userSub });
      if (
        existingUser &&
        JSON.parse(existingUser.data).characterId !== data.characterId
      )
        fail(409, "This account already has a character in this campaign.");
      db.prepare(
        "INSERT INTO members VALUES (?, ?, ?, ?) ON CONFLICT (campaign, character_id) DO UPDATE SET data = excluded.data",
      ).run(id, data.characterId, data.userSub, JSON.stringify(data));
      audit(id, actor, "character", data.characterId);
      return data;
    },
    updateCampaign(id, actor, input) {
      requireGm(actor);
      campaign(id);
      const data = { ...parse(campaignSchema, input), id };
      db.prepare("UPDATE campaigns SET data = ? WHERE id = ?").run(
        JSON.stringify(data),
        id,
      );
      audit(id, actor, "campaign", null);
      return data;
    },
    getDraft(id, actor, entryId) {
      requireGm(actor);
      campaign(id);
      const row = record(id, entryId);
      if (!row) fail(404, "Entry not found.");
      return {
        draft: JSON.parse(row.draft),
        published: row.published ? JSON.parse(row.published) : null,
      };
    },
    listDrafts(id, actor, query = {}) {
      requireGm(actor);
      campaign(id);
      const { page, limit } = parse(
        z.object({
          page: z.coerce.number().int().min(1).default(1),
          limit: z.coerce.number().int().min(1).max(50).default(20),
        }),
        query,
      );
      const total = db
        .prepare("SELECT COUNT(*) AS total FROM entries WHERE campaign = ?")
        .get(id).total;
      return {
        items: db
          .prepare(
            "SELECT id, version, draft, published FROM entries WHERE campaign = ? ORDER BY updated_at DESC LIMIT ? OFFSET ?",
          )
          .all(id, limit, (page - 1) * limit)
          .map((row) => {
            const data = JSON.parse(row.draft);
            return {
              id: row.id,
              version: row.version,
              title: data.title,
              type: data.type,
              audience: data.audience,
              hasUnpublishedChanges:
                !row.published ||
                JSON.parse(row.published).version !== row.version,
            };
          }),
        total,
        page,
        pages: Math.ceil(total / limit),
      };
    },
    write(id, actor, input) {
      const data = parse(writeSchema, input);
      return mutate(id, actor, data.mutationId, { action: "write", data }, () =>
        saveDraft(id, actor, data.entry, data.expectedVersion),
      );
    },
    preview(id, actor, entryId) {
      requireGm(actor);
      const { draft, published: prior } = this.getDraft(id, actor, entryId);
      const recipients = this.listCharacters(id, actor)
        .filter(
          (own) =>
            draft.audience.visibility === "party" ||
            draft.audience.visibility === "public" ||
            draft.audience.characterIds.includes(own.characterId),
        )
        .map(({ userSub: _userSub, ...own }) => own);
      const unresolved = draft.relatedIds.filter(
        (relatedId) => !record(id, relatedId),
      );
      return {
        draft,
        previous: prior,
        recipients,
        public: draft.audience.visibility === "public",
        unresolved,
        changedFields: Object.keys(draft).filter(
          (key) => JSON.stringify(draft[key]) !== JSON.stringify(prior?.[key]),
        ),
      };
    },
    previewCharacter(id, actor, characterId, entryId) {
      requireGm(actor);
      campaign(id);
      const row = db
        .prepare(
          "SELECT data FROM members WHERE campaign = ? AND character_id = ?",
        )
        .get(id, characterId);
      if (!row) fail(404, "Character not found.");
      const own = JSON.parse(row.data);
      const reader = { sub: own.userSub, gm: false };
      if (!entryId) return this.overview(id, reader);
      const { draft } = this.getDraft(id, actor, entryId);
      if (!visible(draft, id, reader))
        return { visible: false, characterName: own.characterName };
      const related = permittedRelations(id, draft.relatedIds, reader);
      return {
        visible: true,
        characterName: own.characterName,
        entry: {
          ...clean(draft),
          body: safeBody(id, draft, reader),
          relatedIds: related.map((entry) => entry.id),
          related,
        },
      };
    },
    publish(id, actor, entryId, input) {
      const data = parse(versionSchema, input);
      return mutate(
        id,
        actor,
        data.mutationId,
        { action: "publish", entryId, data },
        () => {
          const row = record(id, entryId);
          if (!row) fail(404, "Entry not found.");
          if (row.version !== data.expectedVersion)
            fail(
              409,
              "Draft changed. Preview the current version before publishing.",
            );
          const entry = JSON.parse(row.draft);
          audienceValid(id, entry.audience);
          validateMapPlacement(id, entry);
          if (entry.audience.visibility === "gm")
            fail(400, "Assign an audience before publishing.");
          for (const related of entry.relatedIds)
            if (!record(id, related))
              fail(400, `Unresolved reference: ${related}`);
          db.prepare(
            "UPDATE entries SET published = ? WHERE campaign = ? AND id = ?",
          ).run(row.draft, id, entryId);
          db.prepare(
            "DELETE FROM entry_search WHERE campaign = ? AND id = ?",
          ).run(id, entryId);
          // Internal link labels may name a note visible only to a different character.
          const searchableBody = entrySearchBody(entry);
          db.prepare(
            "INSERT INTO entry_search VALUES (?, ?, ?, ?, ?, ?, ?)",
          ).run(
            id,
            entry.id,
            entry.title,
            entry.aliases.join(" "),
            entry.summary,
            searchableBody,
            entry.tags.join(" "),
          );
          audit(id, actor, "publish", entryId, {
            version: entry.version,
            audience: entry.audience,
          });
          return {
            id: entryId,
            version: entry.version,
            published: true,
            audience: entry.audience,
          };
        },
      );
    },
    unpublish(id, actor, entryId, input) {
      const data = parse(versionSchema, input);
      return mutate(
        id,
        actor,
        data.mutationId,
        { action: "unpublish", entryId, data },
        () => {
          const row = record(id, entryId);
          if (!row) fail(404, "Entry not found.");
          if (row.version !== data.expectedVersion)
            fail(
              409,
              "Draft changed. Read its current version before withdrawing publication.",
            );
          db.prepare(
            "UPDATE entries SET published = NULL WHERE campaign = ? AND id = ?",
          ).run(id, entryId);
          db.prepare(
            "DELETE FROM entry_search WHERE campaign = ? AND id = ?",
          ).run(id, entryId);
          audit(id, actor, "unpublish", entryId, { version: row.version });
          return { id: entryId, published: false };
        },
      );
    },
    restore(id, actor, entryId, input) {
      const data = parse(restoreSchema, input);
      return mutate(
        id,
        actor,
        data.mutationId,
        { action: "restore", entryId, data },
        () => {
          const row = db
            .prepare(
              "SELECT data FROM revisions WHERE campaign = ? AND id = ? AND version = ?",
            )
            .get(id, entryId, data.version);
          if (!row) fail(404, "Version not found.");
          const {
            version: _version,
            updatedAt: _at,
            ...entry
          } = JSON.parse(row.data);
          return saveDraft(
            id,
            actor,
            entrySchema.parse(entry),
            data.expectedVersion,
            "restore",
          );
        },
      );
    },
    importPreview(id, actor, input) {
      requireGm(actor);
      campaign(id);
      const entries = parse(z.array(entrySchema).min(1).max(50), input.entries);
      if (new Set(entries.map((entry) => entry.id)).size !== entries.length)
        fail(400, "Batch contains duplicate IDs.");
      const batchIds = new Set(entries.map((entry) => entry.id));
      return {
        entries: entries.map((entry) => {
          const current = record(id, entry.id);
          const titles = db
            .prepare(
              "SELECT id, draft FROM entries WHERE campaign = ? AND id != ?",
            )
            .all(id, entry.id)
            .filter(
              (row) =>
                JSON.parse(row.draft).title.toLowerCase() ===
                entry.title.toLowerCase(),
            )
            .map((row) => row.id);
          audienceValid(id, entry.audience);
          return {
            entry,
            expectedVersion: current?.version || 0,
            existing: Boolean(current),
            possibleDuplicates: titles,
            unresolved: entry.relatedIds.filter(
              (related) => !batchIds.has(related) && !record(id, related),
            ),
          };
        }),
      };
    },
    importApply(id, actor, input) {
      const data = parse(
        z
          .object({
            entries: z
              .array(
                z
                  .object({
                    entry: entrySchema,
                    expectedVersion: z.number().int().min(0),
                  })
                  .strict(),
              )
              .min(1)
              .max(50),
            mutationId: z.string().regex(/^[a-zA-Z0-9_-]{1,100}$/),
          })
          .strict(),
        input,
      );
      if (
        new Set(data.entries.map(({ entry }) => entry.id)).size !==
        data.entries.length
      )
        fail(400, "Batch contains duplicate IDs.");
      return mutate(
        id,
        actor,
        data.mutationId,
        { action: "import", data },
        () => {
          const items = data.entries.map(({ entry, expectedVersion }) =>
            saveDraft(id, actor, entry, expectedVersion, "import"),
          );
          return { items, saved: items.length, published: false };
        },
      );
    },
  };
}
