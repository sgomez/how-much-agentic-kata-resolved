import { Hono } from "hono";
import { SignJWT, createLocalJWKSet, exportJWK, generateKeyPair } from "jose";
import { describe, expect, it } from "vitest";

import {
  JWT_AUDIENCE,
  JWT_ISSUER,
  createKeyVerifier,
  requireUser,
} from "../src/index.ts";
import type { AuthEnv } from "../src/index.ts";

const setup = async () => {
  const { privateKey, publicKey } = await generateKeyPair("EdDSA");
  const sign = (claims: { name?: string; issuer?: string } = {}) =>
    new SignJWT(claims.name === undefined ? {} : { name: claims.name })
      .setProtectedHeader({ alg: "EdDSA" })
      .setSubject("user-1")
      .setIssuer(claims.issuer ?? JWT_ISSUER)
      .setAudience(JWT_AUDIENCE)
      .setExpirationTime("5m")
      .sign(privateKey);
  const app = new Hono<AuthEnv>()
    .use(
      requireUser(
        createKeyVerifier(
          createLocalJWKSet({ keys: [await exportJWK(publicKey)] })
        )
      )
    )
    .get("/me", (c) => c.json(c.var.user));
  return { app, sign };
};

describe(requireUser, () => {
  it("puts the token's user on the context", async () => {
    const { app, sign } = await setup();

    const res = await app.request("/me", {
      headers: { authorization: `Bearer ${await sign({ name: "Ana" })}` },
    });

    await expect(res.json()).resolves.toStrictEqual({
      id: "user-1",
      name: "Ana",
    });
  });

  it("rejects a request without a token", async () => {
    const { app } = await setup();

    const res = await app.request("/me");

    expect(res.status).toBe(401);
  });

  it("rejects a token from another issuer", async () => {
    const { app, sign } = await setup();

    const res = await app.request("/me", {
      headers: {
        authorization: `Bearer ${await sign({ issuer: "someone-else", name: "Ana" })}`,
      },
    });

    expect(res.status).toBe(401);
  });

  it("rejects a token without a name", async () => {
    const { app, sign } = await setup();

    const res = await app.request("/me", {
      headers: { authorization: `Bearer ${await sign()}` },
    });

    expect(res.status).toBe(401);
  });
});
