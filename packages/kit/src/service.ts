import { requireUser } from "@hmk/auth";
import type { AuthEnv, TokenVerifier } from "@hmk/auth";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { z } from "zod";

import { isDomainError, statusOf } from "./errors.ts";
import { runWithToken } from "./request-context.ts";

export type ServiceApp = Hono<AuthEnv>;

export interface ServiceOptions {
  name: string;
  /** Checks the bearer token of every request except `/health`. */
  verifier: TokenVerifier;
  /** Mounts the service's routes. Each `http/*.routes.ts` exports one of these. */
  routes: readonly ((app: ServiceApp) => void)[];
  /** Logs one line per request. Off in tests. */
  log?: boolean;
}

/**
 * Builds a service's Hono app: `/health`, authentication, the service's routes,
 * and the translation of domain errors and invalid input into HTTP answers.
 */
export const createService = ({
  name,
  verifier,
  routes,
  log = false,
}: ServiceOptions): ServiceApp => {
  const app = new Hono<AuthEnv>();
  if (log) {
    app.use(logger());
  }

  app.get("/health", (c) => c.json({ service: name, status: "ok" }));

  app.use(requireUser(verifier));
  app.use((c, next) => runWithToken(c.var.token, next));

  for (const mount of routes) {
    mount(app);
  }

  app.notFound((c) =>
    c.json(
      {
        error: {
          code: "not-found",
          message: `${c.req.method} ${c.req.path} does not exist`,
        },
      },
      404
    )
  );

  app.onError((failure, c) => {
    if (isDomainError(failure)) {
      return c.json(
        { error: { code: failure.code, message: failure.message } },
        statusOf(failure)
      );
    }
    if (failure instanceof z.ZodError) {
      return c.json(
        {
          error: { code: "invalid-request", message: z.prettifyError(failure) },
        },
        400
      );
    }
    console.error(`[${name}]`, failure);
    return c.json(
      { error: { code: "internal", message: "Unexpected error" } },
      500
    );
  });

  return app;
};
