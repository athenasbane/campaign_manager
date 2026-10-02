import test from "node:test";
import assert from "node:assert/strict";
import { createAuthenticator } from "./auth.mjs";

test("GM credential is exact, absent credentials are anonymous, and unknown tokens fail closed", async () => {
  const key = "a".repeat(64);
  const auth = createAuthenticator({ LUXTRIA_GM_TOKEN: key });
  assert.deepEqual(await auth(), { sub: null, gm: false });
  assert.deepEqual(await auth(`Bearer ${key}`), { sub: "gm:mcp", gm: true });
  for (const header of [
    "Basic abc",
    `Bearer ${key}extra`,
    "Bearer forged.token.signature",
    "Bearer",
  ])
    await assert.rejects(auth(header), (error) => error.status === 401);
  await assert.rejects(
    createAuthenticator({ LUXTRIA_GM_TOKEN: "short" })("Bearer short"),
    (error) => error.status === 401,
  );
});

test("Cognito identity requires signature, issuer, client, expiry and ID-token use", async () => {
  const { generateKeyPair, SignJWT, createLocalJWKSet, exportJWK } =
    await import("jose");
  const { publicKey, privateKey } = await generateKeyPair("RS256");
  const issuer = "https://cognito-idp.eu-west-2.amazonaws.com/eu-west-2_test";
  const auth = createAuthenticator(
    {
      LUXTRIA_COGNITO_USER_POOL_ID: "eu-west-2_test",
      LUXTRIA_COGNITO_CLIENT_ID: "client",
    },
    {
      keyResolver: createLocalJWKSet({
        keys: [{ ...(await exportJWK(publicKey)), kid: "test", alg: "RS256" }],
      }),
    },
  );
  async function signed({
    claims = {},
    iss = issuer,
    aud = "client",
    expiry = "5m",
    key = privateKey,
  } = {}) {
    return new SignJWT({ token_use: "id", ...claims })
      .setProtectedHeader({ alg: "RS256", kid: "test" })
      .setSubject("verified-account")
      .setIssuer(iss)
      .setAudience(aud)
      .setIssuedAt()
      .setExpirationTime(expiry)
      .sign(key);
  }
  assert.deepEqual(await auth(`Bearer ${await signed()}`), {
    sub: "verified-account",
    gm: false,
  });
  assert.equal(
    (
      await auth(
        `Bearer ${await signed({ claims: { "cognito:groups": ["luxtria-gm"] } })}`,
      )
    ).gm,
    true,
  );
  for (const options of [
    { aud: "different-client" },
    { iss: "https://wrong.example" },
    { expiry: "-1s" },
    { claims: { token_use: "access" } },
    { key: (await generateKeyPair("RS256")).privateKey },
  ]) {
    await assert.rejects(
      auth(`Bearer ${await signed(options)}`),
      (error) => error.status === 401,
    );
  }
});
