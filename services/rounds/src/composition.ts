import { createJwksVerifier } from "@hmk/auth";
import type { TokenVerifier } from "@hmk/auth";
import { createService, createServiceClient } from "@hmk/kit";
import type { ServiceApp } from "@hmk/kit";
import { jwksUrl, urlOf } from "@hmk/kit/topology";

import { CreateRound } from "./application/create-round.use-case.ts";
import { GetRoundInternal } from "./application/get-round-internal.query.ts";
import { GetRoundView } from "./application/get-round-view.query.ts";
import type { CatalogPort } from "./domain/ports/catalog.port.ts";
import type { ClockPort } from "./domain/ports/clock.port.ts";
import { roundsRoutes } from "./http/rounds.routes.ts";
import { CatalogHttpAdapter } from "./infra/catalog-http.adapter.ts";
import { MemoryRoundRepository } from "./infra/memory-round-repository.adapter.ts";
import { SystemClock } from "./infra/system-clock.adapter.ts";

export interface RoundsDeps {
  verifier: TokenVerifier;
  catalog: CatalogPort;
  clock?: ClockPort;
  log?: boolean;
}

/**
 * Composition root: the only file that sees every layer.
 * Build repositories, adapters, use cases and queries here, then pass them to
 * your `http/*.routes.ts`. See services/catalog/src/composition.ts.
 */
export const composeRounds = ({
  verifier,
  catalog,
  clock = new SystemClock(),
  log,
}: RoundsDeps): ServiceApp => {
  const rounds = new MemoryRoundRepository();
  const createRound = new CreateRound({ catalog, clock, rounds });
  const getRoundView = new GetRoundView({ clock, rounds });
  const getRoundInternal = new GetRoundInternal({ clock, rounds });

  return createService({
    log,
    name: "rounds",
    routes: [roundsRoutes({ createRound, getRoundInternal, getRoundView })],
    verifier,
  });
};

/** The service wired with its real adapters, configured from the environment. */
export const composeRoundsFromEnv = (_env: NodeJS.ProcessEnv): ServiceApp =>
  composeRounds({
    catalog: new CatalogHttpAdapter(createServiceClient(urlOf("catalog"))),
    clock: new SystemClock(),
    log: true,
    verifier: createJwksVerifier(jwksUrl()),
  });
