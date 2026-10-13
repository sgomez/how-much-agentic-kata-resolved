import { createJwksVerifier } from "@hmk/auth";
import type { TokenVerifier } from "@hmk/auth";
import { createService, createServiceClient } from "@hmk/kit";
import type { ServiceApp } from "@hmk/kit";
import { jwksUrl, urlOf } from "@hmk/kit/topology";

import { ListEstimates } from "./application/list-estimates.query.ts";
import { SendEstimate } from "./application/send-estimate.use-case.ts";
import type { RoundsPort } from "./domain/ports/rounds.port.ts";
import { scoringRoutes } from "./http/scoring.routes.ts";
import { MemoryEstimatesRepository } from "./infra/memory-estimates-repository.adapter.ts";
import { RoundsHttpAdapter } from "./infra/rounds-http.adapter.ts";

export interface ScoringDeps {
  verifier: TokenVerifier;
  rounds: RoundsPort;
  log?: boolean;
}

/**
 * Composition root: the only file that sees every layer.
 * Build repositories, adapters, use cases and queries here, then pass them to
 * your `http/*.routes.ts`. See services/catalog/src/composition.ts.
 */
export const composeScoring = ({
  verifier,
  rounds,
  log,
}: ScoringDeps): ServiceApp => {
  const estimates = new MemoryEstimatesRepository();
  const sendEstimate = new SendEstimate({ estimates, rounds });
  const listEstimates = new ListEstimates({ estimates });

  return createService({
    log,
    name: "scoring",
    routes: [scoringRoutes({ listEstimates, sendEstimate })],
    verifier,
  });
};

/** The service wired with its real adapters, configured from the environment. */
export const composeScoringFromEnv = (_env: NodeJS.ProcessEnv): ServiceApp =>
  composeScoring({
    log: true,
    rounds: new RoundsHttpAdapter(createServiceClient(urlOf("rounds"))),
    verifier: createJwksVerifier(jwksUrl()),
  });
