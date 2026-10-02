import { z } from "zod";

export const entryTypes = [
  "person",
  "place",
  "faction",
  "history",
  "culture",
  "rules",
  "lore",
  "session",
  "mission",
  "knowledge",
  "handout",
];
export const idSchema = z.string().regex(/^[a-zA-Z0-9_-]{1,100}$/);
const coordinateSchema = z.tuple([z.number().finite(), z.number().finite()]);
export const mapFeatureSchema = z
  .object({
    mapId: idSchema,
    key: idSchema,
    type: z.enum(["landmark", "district", "route", "gate", "street"]),
    geometry: z.discriminatedUnion("type", [
      z
        .object({ type: z.literal("point"), coordinates: coordinateSchema })
        .strict(),
      z
        .object({
          type: z.literal("polygon"),
          coordinates: z.array(coordinateSchema).min(3).max(5000),
        })
        .strict(),
      z
        .object({
          type: z.literal("polyline"),
          coordinates: z.array(coordinateSchema).min(2).max(5000),
        })
        .strict(),
      z
        .object({
          type: z.literal("rectangle"),
          bounds: z.tuple([coordinateSchema, coordinateSchema]),
        })
        .strict(),
    ]),
    minZoom: z.number().finite().min(-6).max(6).nullable().optional(),
    maxZoom: z.number().finite().min(-6).max(6).nullable().optional(),
  })
  .strict()
  .refine(
    (value) =>
      value.minZoom == null ||
      value.maxZoom == null ||
      value.minZoom <= value.maxZoom,
    "Minimum zoom must not exceed maximum zoom.",
  );
export const audienceSchema = z
  .object({
    visibility: z.enum(["gm", "public", "party", "characters"]),
    characterIds: z.array(idSchema).max(100).default([]),
  })
  .strict()
  .superRefine((value, context) => {
    if (value.visibility === "characters" && !value.characterIds.length) {
      context.addIssue({
        code: "custom",
        message: "Select at least one character.",
        path: ["characterIds"],
      });
    }
    if (value.visibility !== "characters" && value.characterIds.length) {
      context.addIssue({
        code: "custom",
        message: "Character recipients require characters visibility.",
        path: ["characterIds"],
      });
    }
  });
export const entrySchema = z
  .object({
    id: idSchema,
    type: z.enum(entryTypes),
    title: z.string().trim().min(1).max(200),
    summary: z.string().trim().max(800).default(""),
    body: z.string().max(250000).default(""),
    aliases: z.array(z.string().trim().min(1).max(150)).max(30).default([]),
    tags: z.array(z.string().trim().min(1).max(80)).max(30).default([]),
    relatedIds: z.array(idSchema).max(100).default([]),
    source: z.string().max(1000).default(""),
    sourceMetadata: z
      .record(
        z.string(),
        z.union([z.string(), z.boolean(), z.number(), z.array(z.string())]),
      )
      .default({}),
    audience: audienceSchema.default({ visibility: "gm", characterIds: [] }),
    mapFeature: mapFeatureSchema.nullable().optional(),
  })
  .strict();
export const writeSchema = z
  .object({
    entry: entrySchema,
    expectedVersion: z.number().int().min(0),
    mutationId: idSchema,
  })
  .strict();
export const versionSchema = z
  .object({ expectedVersion: z.number().int().min(1), mutationId: idSchema })
  .strict();
export const restoreSchema = versionSchema.extend({
  version: z.number().int().min(1),
});
export const memberSchema = z
  .object({
    characterId: idSchema,
    characterName: z.string().trim().min(1).max(150),
    userSub: z.string().trim().min(1).max(200),
    displayName: z.string().trim().max(150).default(""),
  })
  .strict();
export const campaignSchema = z
  .object({
    name: z.string().trim().min(1).max(150),
    description: z.string().max(1000),
    nextSession: z.string().datetime({ offset: true }).nullable(),
    timezone: z.string().refine((value) => {
      try {
        new Intl.DateTimeFormat("en", { timeZone: value });
        return true;
      } catch {
        return false;
      }
    }, "Use a valid timezone."),
    primerId: idSchema.nullable(),
  })
  .strict();
