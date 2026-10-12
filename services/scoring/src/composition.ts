import { createJwksVerifier } from "@hmk/auth";
import type { TokenVerifier } from "@hmk/auth";
import { createService } from "@hmk/kit";
import type { ServiceApp } from "@hmk/kit";
import { jwksUrl } from "@hmk/kit/topology";

export interface ScoringDeps {
  verifier: TokenVerifier;
  log?: boolean;
}

/**
 * Composition root: the only file that sees every layer.
 * Build repositories, adapters, use cases and queries here, then pass them to
 * your `http/*.routes.ts`. See services/catalog/src/composition.ts.
 */
export const composeScoring = ({ verifier, log }: ScoringDeps): ServiceApp =>
  createService({ log, name: "scoring", routes: [], verifier });

/** The service wired with its real adapters, configured from the environment. */
export const composeScoringFromEnv = (_env: NodeJS.ProcessEnv): ServiceApp =>
  composeScoring({ log: true, verifier: createJwksVerifier(jwksUrl()) });
