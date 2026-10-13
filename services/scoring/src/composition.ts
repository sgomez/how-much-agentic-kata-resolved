import { createJwksVerifier } from "@hmk/auth";
import type { TokenVerifier } from "@hmk/auth";
import { createService, createServiceClient } from "@hmk/kit";
import type { ServiceApp } from "@hmk/kit";
import { jwksUrl, urlOf } from "@hmk/kit/topology";

import { GetRevealQuery } from "./application/get-reveal.query.ts";
import { GetScoreboardQuery } from "./application/get-scoreboard.query.ts";
import { ListEstimates } from "./application/list-estimates.query.ts";
import { SendEstimate } from "./application/send-estimate.use-case.ts";
import type { GamesPort } from "./domain/ports/games.port.ts";
import type { ImpostorPort } from "./domain/ports/impostor.port.ts";
import type { RoundsPort } from "./domain/ports/rounds.port.ts";
import type { RevealedRoundsRepository } from "./domain/revealed-rounds.repository.ts";
import type { VerdictsRepository } from "./domain/verdicts.repository.ts";
import { scoringRoutes } from "./http/scoring.routes.ts";
import { GamesHttpAdapter } from "./infra/games-http.adapter.ts";
import { ImpostorHttpAdapter } from "./infra/impostor-http.adapter.ts";
import { MemoryEstimatesRepository } from "./infra/memory-estimates-repository.adapter.ts";
import { MemoryGamesAdapter } from "./infra/memory-games.adapter.ts";
import { MemoryImpostorAdapter } from "./infra/memory-impostor.adapter.ts";
import { MemoryRevealedRoundsAdapter } from "./infra/memory-revealed-rounds.adapter.ts";
import { MemoryRoundsAdapter } from "./infra/memory-rounds.adapter.ts";
import { MemoryVerdictsAdapter } from "./infra/memory-verdicts.adapter.ts";
import { RoundsHttpAdapter } from "./infra/rounds-http.adapter.ts";

export interface ScoringDeps {
  verifier: TokenVerifier;
  rounds?: RoundsPort;
  games?: GamesPort;
  impostor?: ImpostorPort;
  revealedRounds?: RevealedRoundsRepository;
  verdicts?: VerdictsRepository;
  log?: boolean;
}

/**
 * Composition root: the only file that sees every layer.
 * Build repositories, adapters, use cases and queries here, then pass them to
 * your `http/*.routes.ts`. See services/catalog/src/composition.ts.
 */
export const composeScoring = ({
  verifier,
  rounds = new MemoryRoundsAdapter(),
  games = new MemoryGamesAdapter(),
  impostor = new MemoryImpostorAdapter(),
  revealedRounds = new MemoryRevealedRoundsAdapter(),
  verdicts = new MemoryVerdictsAdapter(),
  log,
}: ScoringDeps): ServiceApp => {
  const estimates = new MemoryEstimatesRepository();
  const sendEstimate = new SendEstimate({ estimates, rounds });
  const listEstimates = new ListEstimates({ estimates });
  const getScoreboard = new GetScoreboardQuery({
    estimates,
    games,
    impostor,
    revealedRounds,
    rounds,
    verdicts,
  });
  const getReveal = new GetRevealQuery({
    estimates,
    games,
    revealedRounds,
    rounds,
  });

  return createService({
    log,
    name: "scoring",
    routes: [
      scoringRoutes({ getReveal, getScoreboard, listEstimates, sendEstimate }),
    ],
    verifier,
  });
};

/** The service wired with its real adapters, configured from the environment. */
export const composeScoringFromEnv = (_env: NodeJS.ProcessEnv): ServiceApp =>
  composeScoring({
    games: new GamesHttpAdapter(createServiceClient(urlOf("games"))),
    impostor: new ImpostorHttpAdapter(createServiceClient(urlOf("impostor"))),
    log: true,
    rounds: new RoundsHttpAdapter(createServiceClient(urlOf("rounds"))),
    verifier: createJwksVerifier(jwksUrl()),
  });
