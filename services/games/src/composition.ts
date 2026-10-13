import { createJwksVerifier } from "@hmk/auth";
import type { TokenVerifier } from "@hmk/auth";
import { createService, createServiceClient } from "@hmk/kit";
import type { ServiceApp } from "@hmk/kit";
import { jwksUrl, urlOf } from "@hmk/kit/topology";

import { CreateGame } from "./application/create-game.use-case.ts";
import { GetGameView } from "./application/game-view.query.ts";
import { JoinGame } from "./application/join-game.use-case.ts";
import { ListPlayers } from "./application/list-players.query.ts";
import { StartGame } from "./application/start-game.use-case.ts";
import type { GameRepository } from "./domain/game.repository.ts";
import type { CodeGenerator } from "./domain/ports/code-generator.port.ts";
import type { RoundsPort } from "./domain/ports/rounds.port.ts";
import { gamesRoutes } from "./http/games.routes.ts";
import { MemoryGameRepository } from "./infra/memory-game-repository.adapter.ts";
import { randomCodeGenerator } from "./infra/random-code-generator.adapter.ts";
import { RoundsHttpAdapter } from "./infra/rounds-http.adapter.ts";

export interface GamesDeps {
  verifier: TokenVerifier;
  codes: CodeGenerator;
  rounds: RoundsPort;
  /** Tests pass a repository they can fill; by default a new empty one. */
  games?: GameRepository;
  log?: boolean;
}

/** Composition root: the only file that sees every layer. */
export const composeGames = ({
  verifier,
  codes,
  rounds,
  games = new MemoryGameRepository(),
  log,
}: GamesDeps): ServiceApp => {
  const createGame = new CreateGame({ codes, games });
  const gameView = new GetGameView({ games });
  const joinGame = new JoinGame({ games });
  const listPlayers = new ListPlayers({ games });
  const startGame = new StartGame({ games, rounds });
  return createService({
    log,
    name: "games",
    routes: [
      gamesRoutes({ createGame, gameView, joinGame, listPlayers, startGame }),
    ],
    verifier,
  });
};

/** The service wired with its real adapters, configured from the environment. */
export const composeGamesFromEnv = (_env: NodeJS.ProcessEnv): ServiceApp =>
  composeGames({
    codes: randomCodeGenerator,
    log: true,
    rounds: new RoundsHttpAdapter(createServiceClient(urlOf("rounds"))),
    verifier: createJwksVerifier(jwksUrl()),
  });
