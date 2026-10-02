import { build } from "esbuild";
import { mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
mkdirSync(".local/lambda", { recursive: true, mode: 0o700 });
await build({
  entryPoints: ["server/campaign/lambda.mjs"],
  outfile: ".local/lambda/index.mjs",
  bundle: true,
  platform: "node",
  target: "node24",
  format: "esm",
  banner: {
    js: 'import { createRequire } from "node:module"; const require = createRequire(import.meta.url);',
  },
});
execFileSync("zip", [
  "-j",
  ".local/luxtria-lambda.zip",
  ".local/lambda/index.mjs",
]);
console.log(
  "Lambda artifact ready at .local/luxtria-lambda.zip (contains code only).",
);
