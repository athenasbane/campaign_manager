import "../server/campaign/env.mjs";
import { mkdirSync, writeFileSync } from "node:fs";
if (!process.env.LUXTRIA_GM_TOKEN || process.env.LUXTRIA_GM_TOKEN.length < 32)
  throw new Error("Missing private GM credential.");
mkdirSync(".local", { recursive: true, mode: 0o700 });
writeFileSync(
  ".local/aws-stack-parameters.json",
  JSON.stringify([
    { ParameterKey: "GmToken", ParameterValue: process.env.LUXTRIA_GM_TOKEN },
    { ParameterKey: "CognitoPool", ParameterValue: "eu-west-2_C7MuxgGwd" },
    {
      ParameterKey: "CognitoClient",
      ParameterValue: "38b1fjrameibc4ebf2cu36ekk8",
    },
  ]),
  { mode: 0o600 },
);
console.log("Private deployment parameters prepared.");
