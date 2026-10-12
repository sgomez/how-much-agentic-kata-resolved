import { createStaticVerifier } from "@hmk/auth";
import { describe, expect, it } from "vitest";
import { z } from "zod";

import { createService, currentToken } from "../src/index.ts";

class TableFullError extends Error {
  readonly kind = "conflict";
  readonly code = "table-full";

  constructor() {
    super("The table is full");
    this.name = "TableFullError";
  }
}

const app = createService({
  name: "demo",
  routes: [
    (a) => {
      a.get("/me", (c) => c.json({ user: c.var.user, token: currentToken() }));
      a.get("/full", () => {
        throw new TableFullError();
      });
      a.post("/echo", async (c) =>
        c.json(z.object({ n: z.number() }).parse(await c.req.json()))
      );
      a.get("/boom", () => {
        throw new Error("bug");
      });
    },
  ],
  verifier: createStaticVerifier({ t1: { id: "u1", name: "Ana" } }),
});
const auth = { authorization: "Bearer t1" };

describe(createService, () => {
  it("serves /health without authentication", async () => {
    const res = await app.request("/health");

    await expect(res.json()).resolves.toStrictEqual({
      service: "demo",
      status: "ok",
    });
  });

  it("authenticates every other route and exposes the caller's token", async () => {
    const anonymous = await app.request("/me");
    const authenticated = await app.request("/me", { headers: auth });

    expect(anonymous.status).toBe(401);
    await expect(authenticated.json()).resolves.toStrictEqual({
      token: "t1",
      user: { id: "u1", name: "Ana" },
    });
  });

  it("maps a domain error to its HTTP status", async () => {
    const res = await app.request("/full", { headers: auth });

    expect(res.status).toBe(409);
    await expect(res.json()).resolves.toStrictEqual({
      error: { code: "table-full", message: "The table is full" },
    });
  });

  it("maps invalid input to 400", async () => {
    const res = await app.request("/echo", {
      body: JSON.stringify({ n: "x" }),
      headers: auth,
      method: "POST",
    });

    expect(res.status).toBe(400);
  });

  it("hides unexpected errors behind a 500", async () => {
    const { error } = console;
    console.error = () => {};
    const res = await app.request("/boom", { headers: auth });
    console.error = error;

    expect(res.status).toBe(500);
    await expect(res.json()).resolves.toStrictEqual({
      error: { code: "internal", message: "Unexpected error" },
    });
  });
});
