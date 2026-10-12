import { createJwksVerifier } from "@hmk/auth";
import type { TokenVerifier } from "@hmk/auth";
import { createService, createServiceClient } from "@hmk/kit";
import type { ServiceApp } from "@hmk/kit";
import { jwksUrl, urlOf } from "@hmk/kit/topology";

import type { CatalogPort } from "./domain/ports/catalog.port.ts";
import { CatalogHttpAdapter } from "./infra/catalog-http.adapter.ts";

export interface RoundsDeps {
  verifier: TokenVerifier;
  /** Pass it to the use cases that need a question. */
  catalog: CatalogPort;
  log?: boolean;
}

/**
 * Composition root: the only file that sees every layer.
 * Build repositories, adapters, use cases and queries here, then pass them to
 * your `http/*.routes.ts`. See services/catalog/src/composition.ts.
 */
export const composeRounds = ({ verifier, log }: RoundsDeps): ServiceApp =>
  createService({ log, name: "rounds", routes: [], verifier });

/** The service wired with its real adapters, configured from the environment. */
export const composeRoundsFromEnv = (_env: NodeJS.ProcessEnv): ServiceApp =>
  composeRounds({
    catalog: new CatalogHttpAdapter(createServiceClient(urlOf("catalog"))),
    log: true,
    verifier: createJwksVerifier(jwksUrl()),
  });
