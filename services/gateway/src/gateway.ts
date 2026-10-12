import { existsSync } from "node:fs";
import path from "node:path";

import { SERVICE_NAMES } from "@hmk/kit/topology";
import type { ServiceName } from "@hmk/kit/topology";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { proxy } from "hono/proxy";

import type { Auth } from "./auth.ts";

export interface GatewayOptions {
  auth: Auth;
  /** Base URL of each service. */
  serviceUrl: (service: ServiceName) => string;
  /** Built web app to serve, if it exists (`pnpm start`). In dev, Vite serves it. */
  webDist?: string | undefined;
  log?: boolean;
  /** Replaces `fetch` towards the services. For tests. */
  fetchUpstream?: (request: Request) => Promise<Response>;
}

const isService = (name: string): name is ServiceName =>
  (SERVICE_NAMES as readonly string[]).includes(name);

/**
 * The only door to the system:
 * - `/api/auth/*`     Better Auth (anonymous sign-in, nickname, JWKS)
 * - `/api/<service>/*` proxied to the service, with the player's JWT as bearer
 * - anything else     the built web app, if any
 */
export const createGateway = ({
  auth,
  serviceUrl,
  webDist,
  log = false,
  fetchUpstream,
}: GatewayOptions) => {
  const app = new Hono();
  if (log) {
    app.use(logger());
  }

  app.get("/health", (c) => c.json({ service: "gateway", status: "ok" }));

  app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw));

  app.all("/api/:service/*", async (c) => {
    const service = c.req.param("service");
    if (!isService(service)) {
      return c.json(
        {
          error: { code: "not-found", message: `No service called ${service}` },
        },
        404
      );
    }
    // Service-to-service routes live under /internal and are never reachable
    // by players: they may carry solutions or who the impostor is.
    if (c.req.path.startsWith(`/api/${service}/internal`)) {
      return c.json(
        { error: { code: "not-found", message: "Not found" } },
        404
      );
    }
    const { headers } = c.req.raw;
    const { token } = await auth.api
      .getToken({ headers })
      .catch(() => ({ token: undefined }));
    if (token === undefined) {
      return c.json(
        { error: { code: "unauthenticated", message: "Sign in first" } },
        401
      );
    }
    const url = new URL(c.req.url);
    const target = new URL(
      url.pathname.slice(`/api/${service}`.length) + url.search,
      serviceUrl(service)
    );
    return proxy(target, {
      headers: {
        ...c.req.header(),
        authorization: `Bearer ${token}`,
        cookie: undefined,
        host: undefined,
      },
      raw: c.req.raw,
      ...(fetchUpstream === undefined ? {} : { customFetch: fetchUpstream }),
    });
  });

  if (webDist !== undefined && existsSync(webDist)) {
    // serveStatic resolves `root` against the working directory.
    const root = path.relative(process.cwd(), webDist);
    app.use("*", serveStatic({ root }));
    app.get("*", serveStatic({ path: "index.html", root }));
  }

  return app;
};
