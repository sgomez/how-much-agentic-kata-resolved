import { CreateGameRequest } from "@hmk/contracts/games";
import type { CreateGameResponse, GameView } from "@hmk/contracts/games";
import type { ServiceApp } from "@hmk/kit";

import type { CreateGame } from "../application/create-game.use-case.ts";
import type { GetGameView } from "../application/game-view.query.ts";
import type { StartGame } from "../application/start-game.use-case.ts";

/** Public API of the games service, mounted by the gateway under `/api/games`. */
export const gamesRoutes =
  (deps: {
    createGame: Pick<CreateGame, "execute">;
    gameView: Pick<GetGameView, "execute">;
    startGame: Pick<StartGame, "execute">;
  }) =>
  (app: ServiceApp): void => {
    app.post("/", async (c) => {
      const { packs, roundSeconds, rounds, impostorMode } =
        CreateGameRequest.parse(await c.req.json());
      const { id, name } = c.var.user;
      const code = await deps.createGame.execute({
        host: { id, nickname: name },
        settings: { impostorMode, packs: packs ?? [], roundSeconds, rounds },
      });
      const body: CreateGameResponse = { code };
      return c.json(body, 201);
    });

    app.post("/:code/start", async (c) => {
      await deps.startGame.execute({
        code: c.req.param("code"),
        playerId: c.var.user.id,
      });
      return c.body(null, 204);
    });

    app.get("/:code", async (c) => {
      const body: GameView = await deps.gameView.execute(c.req.param("code"));
      return c.json(body);
    });
  };
