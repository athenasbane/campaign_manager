import "./env.mjs";
import express from "express";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { createStore } from "./store.mjs";
import { createCampaignService } from "./service.mjs";
import { createAuthenticator } from "./auth.mjs";
import { createCampaignApp } from "./app.mjs";

const db = createStore(
  resolve(process.env.LUXTRIA_DB_PATH || ".local/luxtria.sqlite"),
);
const app = createCampaignApp(
  createCampaignService(db),
  createAuthenticator(),
  { allowedOrigin: process.env.LUXTRIA_ALLOWED_ORIGIN },
);
const build = resolve("build");
if (existsSync(build)) {
  app.use(express.static(build));
  app.get("/{*path}", (_req, res) =>
    res.sendFile(resolve(build, "index.html")),
  );
}
const server = app.listen(
  Number(process.env.LUXTRIA_API_PORT || 3001),
  process.env.LUXTRIA_API_HOST || "127.0.0.1",
  () => {
    console.error(
      `Luxtria API listening on ${process.env.LUXTRIA_API_HOST || "127.0.0.1"}:${process.env.LUXTRIA_API_PORT || 3001}`,
    );
  },
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () =>
    server.close(() => {
      db.close();
      process.exit(0);
    }),
  );
