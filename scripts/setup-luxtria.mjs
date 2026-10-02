import { writeFileSync, existsSync, mkdirSync } from "node:fs";
import { randomBytes } from "node:crypto";
if (existsSync(".env.campaign")) {
  console.log(
    "Local campaign configuration already exists. Credentials were preserved.",
  );
} else {
  mkdirSync(".local", { recursive: true, mode: 0o700 });
  writeFileSync(
    ".env.campaign",
    `LUXTRIA_GM_TOKEN=${randomBytes(32).toString("hex")}\nLUXTRIA_API_URL=http://127.0.0.1:3001\nLUXTRIA_DB_PATH=.local/luxtria.sqlite\n`,
    { mode: 0o600, flag: "wx" },
  );
  console.log(
    "Created private local campaign configuration. Run npm start to launch Luxtria.",
  );
}
