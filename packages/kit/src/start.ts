import { serve } from "@hono/node-server";

import type { ServiceApp } from "./service.ts";

/** Starts a service's HTTP server. Called from each service's `main.ts`. */
export const startService = (
  app: ServiceApp,
  name: string,
  port: number
): void => {
  serve({ fetch: app.fetch, port }, (info) => {
    console.log(`[${name}] listening on http://localhost:${info.port}`);
  });
};
