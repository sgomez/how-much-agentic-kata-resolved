import { randomBytes } from "node:crypto";
import path from "node:path";

import { PORTS, urlOf } from "@hmk/kit/topology";
import { serve } from "@hono/node-server";

import { createAuth } from "./auth.ts";
import { createGateway } from "./gateway.ts";

const app = createGateway({
  auth: createAuth({
    secret: process.env.BETTER_AUTH_SECRET ?? randomBytes(32).toString("hex"),
    extraHosts: process.env.HMK_ALLOWED_HOSTS?.split(",") ?? [],
  }),
  log: true,
  serviceUrl: urlOf,
  webDist: path.resolve(import.meta.dirname, "../../../apps/web/dist"),
});

serve({ fetch: app.fetch, port: PORTS.gateway }, (info) => {
  console.log(`[gateway] listening on http://localhost:${info.port}`);
});
