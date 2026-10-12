import { createMiddleware } from "hono/factory";

import type { AuthUser, TokenVerifier } from "./verifier.ts";

export interface AuthEnv {
  Variables: {
    /** The player who made the request. */
    user: AuthUser;
    /** The raw bearer token, forwarded on service-to-service calls. */
    token: string;
  };
}

const BEARER = /^Bearer (?<token>.+)$/u;

/** Rejects requests without a valid bearer token; puts `user` and `token` on the context. */
export const requireUser = (verifier: TokenVerifier) =>
  createMiddleware<AuthEnv>(async (c, next) => {
    const token = BEARER.exec(c.req.header("authorization") ?? "")?.groups
      ?.token;
    if (token === undefined) {
      return c.json(
        { error: { code: "unauthenticated", message: "Missing bearer token" } },
        401
      );
    }
    try {
      c.set("user", await verifier.verify(token));
    } catch {
      return c.json(
        { error: { code: "unauthenticated", message: "Invalid token" } },
        401
      );
    }
    c.set("token", token);
    return next();
  });
