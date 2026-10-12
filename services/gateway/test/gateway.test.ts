import { createKeyVerifier } from "@hmk/auth";
import { createLocalJWKSet } from "jose";
import type { JSONWebKeySet } from "jose";
import { describe, expect, it } from "vitest";

import { createAuth } from "../src/auth.ts";
import { createGateway } from "../src/gateway.ts";

const ORIGIN = "http://localhost:3000";

const gatewayWithRecordingUpstream = () => {
  const upstream: Request[] = [];
  const app = createGateway({
    auth: createAuth({ secret: "test-secret-test-secret-test-secret" }),
    fetchUpstream: (request) => {
      upstream.push(request);
      return Promise.resolve(Response.json({ ok: true }));
    },
    serviceUrl: (service) => `http://${service}.internal`,
  });
  return { app, upstream };
};

/** Signs in anonymously and sets the nickname, like the web app does. Returns the session cookie. */
const signIn = async (
  app: ReturnType<typeof createGateway>,
  nickname: string
): Promise<string> => {
  const signInRes = await app.request(`${ORIGIN}/api/auth/sign-in/anonymous`, {
    body: "{}",
    headers: { "content-type": "application/json", origin: ORIGIN },
    method: "POST",
  });
  expect(signInRes.status).toBe(200);
  const cookie = signInRes.headers
    .getSetCookie()
    .map((c) => c.split(";")[0])
    .join("; ");

  const updateRes = await app.request(`${ORIGIN}/api/auth/update-user`, {
    body: JSON.stringify({ name: nickname }),
    headers: { "content-type": "application/json", cookie, origin: ORIGIN },
    method: "POST",
  });
  expect(updateRes.status).toBe(200);
  return cookie;
};

describe("gateway", () => {
  it("rejects service calls without a session", async () => {
    const { app, upstream } = gatewayWithRecordingUpstream();

    const res = await app.request(`${ORIGIN}/api/catalog/packs`);

    expect(res.status).toBe(401);
    expect(upstream).toHaveLength(0);
  });

  it("never exposes a service's /internal routes to players", async () => {
    const { app, upstream } = gatewayWithRecordingUpstream();
    const cookie = await signIn(app, "Eva");

    const res = await app.request(
      `${ORIGIN}/api/rounds/internal/games/ABCD/rounds`,
      { headers: { cookie } }
    );

    expect(res.status).toBe(404);
    expect(upstream).toHaveLength(0);
  });

  it("answers 404 for an unknown service", async () => {
    const { app } = gatewayWithRecordingUpstream();
    const cookie = await signIn(app, "Ana");

    const res = await app.request(`${ORIGIN}/api/nope/x`, {
      headers: { cookie },
    });

    expect(res.status).toBe(404);
  });

  it("forwards a signed-in player's call with a JWT that services can verify", async () => {
    const { app, upstream } = gatewayWithRecordingUpstream();
    const cookie = await signIn(app, "Ana");

    const res = await app.request(`${ORIGIN}/api/catalog/packs?x=1`, {
      headers: { cookie },
    });

    expect(res.status).toBe(200);
    const [forwarded] = upstream;
    expect(forwarded?.url).toBe("http://catalog.internal/packs?x=1");
    expect(forwarded?.headers.get("cookie")).toBeNull();
    const token =
      forwarded?.headers.get("authorization")?.replace("Bearer ", "") ?? "";
    const jwksRes = await app.request(`${ORIGIN}/api/auth/jwks`);
    const jwks = (await jwksRes.json()) as JSONWebKeySet;
    const user = await createKeyVerifier(createLocalJWKSet(jwks)).verify(token);
    expect(user.name).toBe("Ana");
  });
});
