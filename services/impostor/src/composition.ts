import { createJwksVerifier } from "@hmk/auth";
import type { TokenVerifier } from "@hmk/auth";
import { createService } from "@hmk/kit";
import type { ServiceApp } from "@hmk/kit";
import { jwksUrl } from "@hmk/kit/topology";

export interface ImpostorDeps {
  verifier: TokenVerifier;
  log?: boolean;
}

/**
 * Composition root: the only file that sees every layer.
 * Build repositories, adapters, use cases and queries here, then pass them to
 * your `http/*.routes.ts`. See services/catalog/src/composition.ts.
 */
export const composeImpostor = ({ verifier, log }: ImpostorDeps): ServiceApp =>
  createService({ log, name: "impostor", routes: [], verifier });

/** The service wired with its real adapters, configured from the environment. */
export const composeImpostorFromEnv = (_env: NodeJS.ProcessEnv): ServiceApp =>
  composeImpostor({
    log: true,
    verifier: createJwksVerifier(jwksUrl()),
  });
