import { createJwksVerifier } from "@hmk/auth";
import type { TokenVerifier } from "@hmk/auth";
import { createService } from "@hmk/kit";
import type { ServiceApp } from "@hmk/kit";
import { jwksUrl } from "@hmk/kit/topology";

import { CreateGame } from "./application/create-game.use-case.ts";
import { GetGameView } from "./application/game-view.query.ts";
import type { CodeGenerator } from "./domain/ports/code-generator.port.ts";
import { gamesRoutes } from "./http/games.routes.ts";
import { MemoryGameRepository } from "./infra/memory-game-repository.adapter.ts";
import { randomCodeGenerator } from "./infra/random-code-generator.adapter.ts";

export interface GamesDeps {
  verifier: TokenVerifier;
  codes: CodeGenerator;
  log?: boolean;
}

/** Composition root: the only file that sees every layer. */
export const composeGames = ({
  verifier,
  codes,
  log,
}: GamesDeps): ServiceApp => {
  const games = new MemoryGameRepository();
  const createGame = new CreateGame({ codes, games });
  const gameView = new GetGameView({ games });
  return createService({
    log,
    name: "games",
    routes: [gamesRoutes({ createGame, gameView })],
    verifier,
  });
};

/** The service wired with its real adapters, configured from the environment. */
export const composeGamesFromEnv = (_env: NodeJS.ProcessEnv): ServiceApp =>
  composeGames({
    codes: randomCodeGenerator,
    log: true,
    verifier: createJwksVerifier(jwksUrl()),
  });
