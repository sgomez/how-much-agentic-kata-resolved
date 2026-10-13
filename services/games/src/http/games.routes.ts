import { CreateGameRequest } from "@hmk/contracts/games";
import type {
  CreateGameResponse,
  GameView,
  ListPlayersResponse,
} from "@hmk/contracts/games";
import type { ServiceApp } from "@hmk/kit";

import type { CreateGame } from "../application/create-game.use-case.ts";
import type { GetGameView } from "../application/game-view.query.ts";
import type { JoinGame } from "../application/join-game.use-case.ts";
import type { ListPlayers } from "../application/list-players.query.ts";

/** Public API of the games service, mounted by the gateway under `/api/games`. */
export const gamesRoutes =
  (deps: {
    createGame: Pick<CreateGame, "execute">;
    gameView: Pick<GetGameView, "execute">;
    joinGame: Pick<JoinGame, "execute">;
    listPlayers: Pick<ListPlayers, "execute">;
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

    app.get("/:code", async (c) => {
      const body: GameView = await deps.gameView.execute(c.req.param("code"));
      return c.json(body);
    });

    app.post("/:code/players", async (c) => {
      const { id, name } = c.var.user;
      await deps.joinGame.execute({
        code: c.req.param("code"),
        player: { id, nickname: name },
      });
      return c.body(null, 204);
    });

    app.get("/internal/:code/players", async (c) => {
      const body: ListPlayersResponse = await deps.listPlayers.execute(
        c.req.param("code")
      );
      return c.json(body);
    });
  };
