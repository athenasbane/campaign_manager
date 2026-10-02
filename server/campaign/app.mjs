import express from "express";
import { CampaignError } from "./service.mjs";

export function createCampaignApp(
  service,
  authenticate,
  { allowedOrigin } = {},
) {
  const app = express();
  app.disable("x-powered-by");
  app.use("/api/campaigns", (req, res, next) => {
    res.set("Cache-Control", "private, no-store");
    res.set("Vary", "Authorization, Origin");
    res.set("X-Content-Type-Options", "nosniff");
    if (
      req.headers.origin &&
      allowedOrigin &&
      req.headers.origin === allowedOrigin
    ) {
      res.set("Access-Control-Allow-Origin", allowedOrigin);
      res.set("Access-Control-Allow-Headers", "Authorization, Content-Type");
      res.set("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
    }
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
  });
  app.use(express.json({ limit: "4mb" }));
  app.use("/api/campaigns", async (req, res, next) => {
    try {
      req.actor = await authenticate(req.headers.authorization);
      next();
    } catch (error) {
      next(error);
    }
  });
  const base = "/api/campaigns/:campaign";
  const route = (method, path, work) =>
    app[method](base + path, async (req, res, next) => {
      try {
        res.json(await work(req.params.campaign, req.actor, req));
      } catch (error) {
        next(error);
      }
    });
  route("get", "", (id, actor) => service.overview(id, actor));
  route("get", "/maps/:map", (id, actor, req) =>
    service.atlas(id, actor, req.params.map),
  );
  route("get", "/entries", (id, actor, req) =>
    service.search(id, actor, req.query),
  );
  route("get", "/entries/:entry", (id, actor, req) =>
    service.read(id, actor, req.params.entry),
  );
  route("put", "/entries/:entry/state", (id, actor, req) =>
    service.readerState(id, actor, req.params.entry, req.body),
  );
  route("get", "/gm/characters", (id, actor) =>
    service.listCharacters(id, actor),
  );
  route("post", "/gm/characters", (id, actor, req) =>
    service.saveCharacter(id, actor, req.body),
  );
  route("get", "/gm/characters/:character/preview", (id, actor, req) =>
    service.previewCharacter(id, actor, req.params.character, req.query.entry),
  );
  route("put", "/gm/campaign", (id, actor, req) =>
    service.updateCampaign(id, actor, req.body),
  );
  route("get", "/gm/entries", (id, actor, req) =>
    service.listDrafts(id, actor, req.query),
  );
  route("get", "/gm/entries/:entry", (id, actor, req) =>
    service.getDraft(id, actor, req.params.entry),
  );
  route("post", "/gm/entries", (id, actor, req) =>
    service.write(id, actor, req.body),
  );
  route("get", "/gm/entries/:entry/preview", (id, actor, req) =>
    service.preview(id, actor, req.params.entry),
  );
  route("post", "/gm/entries/:entry/publish", (id, actor, req) =>
    service.publish(id, actor, req.params.entry, req.body),
  );
  route("post", "/gm/entries/:entry/unpublish", (id, actor, req) =>
    service.unpublish(id, actor, req.params.entry, req.body),
  );
  route("post", "/gm/entries/:entry/restore", (id, actor, req) =>
    service.restore(id, actor, req.params.entry, req.body),
  );
  route("post", "/gm/import/preview", (id, actor, req) =>
    service.importPreview(id, actor, req.body),
  );
  route("post", "/gm/import/apply", (id, actor, req) =>
    service.importApply(id, actor, req.body),
  );
  app.use("/api", (_req, res) =>
    res.status(404).json({ message: "Endpoint not found." }),
  );
  app.use((error, _req, res, _next) => {
    const status =
      error instanceof CampaignError
        ? error.status
        : error.type === "entity.too.large"
          ? 413
          : error instanceof SyntaxError
            ? 400
            : 500;
    if (status === 500)
      console.error("Campaign API operation failed:", error.name);
    res.status(status).json({
      message:
        status === 500
          ? "Campaign content is temporarily unavailable."
          : error.message,
    });
  });
  return app;
}
