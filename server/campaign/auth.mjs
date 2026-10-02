import { timingSafeEqual } from "node:crypto";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { CampaignError } from "./service.mjs";

export function createAuthenticator(env = process.env, { keyResolver } = {}) {
  const pool =
    env.LUXTRIA_COGNITO_USER_POOL_ID || env.REACT_APP_COGNITO_USER_POOL_ID;
  const client =
    env.LUXTRIA_COGNITO_CLIENT_ID || env.REACT_APP_COGNITO_CLIENT_ID;
  const issuer = pool
    ? `https://cognito-idp.${pool.split("_")[0]}.amazonaws.com/${pool}`
    : null;
  const jwks =
    keyResolver ||
    (issuer
      ? createRemoteJWKSet(new URL(`${issuer}/.well-known/jwks.json`))
      : null);
  const gmToken = env.LUXTRIA_GM_TOKEN;
  return async (authorization) => {
    if (!authorization) return { sub: null, gm: false };
    const match = /^Bearer (\S+)$/i.exec(authorization);
    if (!match) throw new CampaignError(401, "Please sign in again.");
    const token = match[1];
    if (gmToken && gmToken.length >= 32) {
      const supplied = Buffer.from(token);
      const expected = Buffer.from(gmToken);
      if (
        supplied.length === expected.length &&
        timingSafeEqual(supplied, expected)
      )
        return { sub: "gm:mcp", gm: true };
    }
    if (!jwks || !client)
      throw new CampaignError(
        401,
        "Player sign-in is not configured for this campaign.",
      );
    try {
      const { payload } = await jwtVerify(token, jwks, {
        issuer,
        audience: client,
        algorithms: ["RS256"],
      });
      if (payload.token_use !== "id" || !payload.sub || !payload.exp)
        throw new Error("Invalid identity token");
      return {
        sub: payload.sub,
        gm:
          Array.isArray(payload["cognito:groups"]) &&
          payload["cognito:groups"].includes(
            env.LUXTRIA_GM_GROUP || "luxtria-gm",
          ),
      };
    } catch {
      throw new CampaignError(
        401,
        "Your session has expired. Please sign in again.",
      );
    }
  };
}
