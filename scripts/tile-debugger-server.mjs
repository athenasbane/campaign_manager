import {
  createReadStream,
  existsSync,
  mkdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { createServer } from "node:http";
import { execFile } from "node:child_process";
import { dirname, extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const repoRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));

const args = process.argv.slice(2);

const readArg = (name, fallback) => {
  const index = args.indexOf(name);
  if (index === -1) return fallback;
  return args[index + 1] || fallback;
};

const port = Number(readArg("--port", process.env.PORT || "4173"));
const tileRoot = resolve(
  readArg("--tiles", "/private/tmp/campaign-map-tiles/circular-city")
);
const defaultBucket = readArg("--bucket", "teratin");
const defaultPrefix = readArg("--prefix", "maps/circular-city");
const defaultDistributionId = readArg("--distribution-id", "EOSD7OT72QWH8");
const execFileAsync = promisify(execFile);

const files = {
  "/": join(repoRoot, "tools", "tile-debugger.html"),
  "/tile-debugger.html": join(repoRoot, "tools", "tile-debugger.html"),
  "/leaflet.css": join(repoRoot, "node_modules", "leaflet", "dist", "leaflet.css"),
  "/leaflet.js": join(repoRoot, "node_modules", "leaflet", "dist", "leaflet.js"),
};

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

const send = (res, status, body, headers = {}) => {
  res.writeHead(status, {
    "Content-Type": "text/plain; charset=utf-8",
    ...headers,
  });
  res.end(body);
};

const serveFile = (res, path) => {
  if (!existsSync(path) || !statSync(path).isFile()) {
    send(res, 404, "Not found");
    return;
  }

  res.writeHead(200, {
    "Content-Type": contentTypes[extname(path).toLowerCase()] || "application/octet-stream",
    "Cache-Control": "no-store",
  });
  createReadStream(path).pipe(res);
};

const resolveLocalTile = (urlPath) => {
  const relative = decodeURIComponent(urlPath.replace(/^\/local-tiles\/?/, ""));
  const resolved = resolve(tileRoot, normalize(relative));

  if (!resolved.startsWith(tileRoot)) {
    return null;
  }

  return resolved;
};

const readBody = (req) =>
  new Promise((resolveBody, rejectBody) => {
    const chunks = [];
    let size = 0;

    req.on("data", (chunk) => {
      size += chunk.length;

      if (size > 100 * 1024 * 1024) {
        rejectBody(new Error("Request body too large"));
        req.destroy();
        return;
      }

      chunks.push(chunk);
    });
    req.on("end", () => resolveBody(Buffer.concat(chunks).toString("utf8")));
    req.on("error", rejectBody);
  });

const writeTiles = async (req, res) => {
  let payload;

  try {
    payload = JSON.parse(await readBody(req));
  } catch (error) {
    send(res, 400, `Invalid JSON: ${error.message}`);
    return;
  }

  if (!Array.isArray(payload.tiles) || payload.tiles.length === 0) {
    send(res, 400, "No tiles supplied");
    return;
  }

  const written = [];

  for (const tile of payload.tiles) {
    if (
      !Number.isInteger(tile.z) ||
      !Number.isInteger(tile.x) ||
      !Number.isInteger(tile.y) ||
      typeof tile.dataUrl !== "string"
    ) {
      send(res, 400, "Invalid tile payload");
      return;
    }

    const match = tile.dataUrl.match(/^data:image\/png;base64,(.+)$/);

    if (!match) {
      send(res, 400, "Tiles must be PNG data URLs");
      return;
    }

    const tilePath = resolve(
      tileRoot,
      String(tile.z),
      String(tile.x),
      `${tile.y}.png`
    );

    if (!tilePath.startsWith(tileRoot)) {
      send(res, 400, "Invalid output path");
      return;
    }

    mkdirSync(dirname(tilePath), { recursive: true });
    writeFileSync(tilePath, Buffer.from(match[1], "base64"));
    written.push(`${tile.z}/${tile.x}/${tile.y}.png`);
  }

  res.writeHead(200, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify({ written }, null, 2));
};

const normaliseTileKey = (key) => {
  if (typeof key !== "string") return null;

  const cleaned = key
    .replace(/^https?:\/\/[^/]+\/maps\/circular-city\//, "")
    .replace(/^maps\/circular-city\//, "")
    .replace(/^\/+/, "");

  if (!/^-?\d+\/-?\d+\/-?\d+\.png$/.test(cleaned)) {
    return null;
  }

  return cleaned;
};

const uploadTiles = async (req, res) => {
  let payload;

  try {
    payload = JSON.parse(await readBody(req));
  } catch (error) {
    send(res, 400, `Invalid JSON: ${error.message}`);
    return;
  }

  const keys = Array.from(
    new Set((payload.keys || []).map(normaliseTileKey).filter(Boolean))
  );

  if (keys.length === 0) {
    send(res, 400, "No valid tile keys supplied");
    return;
  }

  const bucket = payload.bucket || defaultBucket;
  const prefix = (payload.prefix || defaultPrefix).replace(/^\/+|\/+$/g, "");
  const distributionId = payload.distributionId || defaultDistributionId;
  const uploaded = [];

  for (const key of keys) {
    const sourcePath = resolve(tileRoot, key);

    if (!sourcePath.startsWith(tileRoot) || !existsSync(sourcePath)) {
      send(res, 400, `Missing local tile: ${key}`);
      return;
    }

    const destination = `s3://${bucket}/${prefix}/${key}`;

    await execFileAsync("aws", [
      "s3",
      "cp",
      sourcePath,
      destination,
      "--cache-control",
      "public,max-age=31536000,immutable",
      "--content-type",
      "image/png",
    ]);
    uploaded.push(`${prefix}/${key}`);
  }

  let invalidation = null;

  if (payload.invalidate !== false && distributionId) {
    const paths = uploaded.map((key) => `/${key}`);
    const { stdout } = await execFileAsync("aws", [
      "cloudfront",
      "create-invalidation",
      "--distribution-id",
      distributionId,
      "--paths",
      ...paths,
    ]);

    try {
      invalidation = JSON.parse(stdout).Invalidation;
    } catch {
      invalidation = stdout.trim();
    }
  }

  res.writeHead(200, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify({ uploaded, invalidation }, null, 2));
};

const server = createServer((req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

  if (url.pathname === "/health") {
    send(res, 200, "ok");
    return;
  }

  if (url.pathname.startsWith("/local-tiles/")) {
    const tilePath = resolveLocalTile(url.pathname);
    if (!tilePath) {
      send(res, 400, "Invalid tile path");
      return;
    }
    serveFile(res, tilePath);
    return;
  }

  if (url.pathname === "/write-tiles" && req.method === "POST") {
    writeTiles(req, res).catch((error) => {
      send(res, 500, error.message);
    });
    return;
  }

  if (url.pathname === "/upload-tiles" && req.method === "POST") {
    uploadTiles(req, res).catch((error) => {
      send(res, 500, error.stderr || error.message);
    });
    return;
  }

  if (files[url.pathname]) {
    serveFile(res, files[url.pathname]);
    return;
  }

  send(res, 404, "Not found");
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Tile debugger: http://localhost:${port}/`);
  console.log(`Local tiles:   ${tileRoot}`);
  console.log(`S3 target:     s3://${defaultBucket}/${defaultPrefix}`);
});
