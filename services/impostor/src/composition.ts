import { createJwksVerifier } from "@hmk/auth";
import type { TokenVerifier } from "@hmk/auth";
import { createService } from "@hmk/kit";
import type { ServiceApp } from "@hmk/kit";
import { jwksUrl } from "@hmk/kit/topology";

import { ChooseImpostor } from "./application/choose-impostor.use-case.ts";
import { GetVerdict } from "./application/get-verdict.query.ts";
import type { Clock } from "./domain/ports/clock.port.ts";
import type { Random } from "./domain/ports/random.port.ts";
import { internalRoutes } from "./http/internal.routes.ts";
import { mathRandom } from "./infra/math-random.adapter.ts";
import { MemoryVotingRepository } from "./infra/memory-voting-repository.adapter.ts";
import { systemClock } from "./infra/system-clock.adapter.ts";

export interface ImpostorDeps {
  verifier: TokenVerifier;
  random?: Random;
  /** Used by the phone routes (opening the voting). */
  clock?: Clock;
  log?: boolean;
}

/**
 * Composition root: the only file that sees every layer.
 * Build repositories, adapters, use cases and queries here, then pass them to
 * your `http/*.routes.ts`. See services/catalog/src/composition.ts.
 */
export const composeImpostor = ({
  verifier,
  random = mathRandom,
  log,
}: ImpostorDeps): ServiceApp => {
  const votings = new MemoryVotingRepository();
  const chooseImpostor = new ChooseImpostor({ random, votings });
  const getVerdict = new GetVerdict({ votings });

  return createService({
    log,
    name: "impostor",
    routes: [internalRoutes({ chooseImpostor, getVerdict })],
    verifier,
  });
};

/** The service wired with its real adapters, configured from the environment. */
export const composeImpostorFromEnv = (_env: NodeJS.ProcessEnv): ServiceApp =>
  composeImpostor({
    clock: systemClock,
    log: true,
    random: mathRandom,
    verifier: createJwksVerifier(jwksUrl()),
  });
