import { CreateRoundRequest } from "@hmk/contracts/rounds";
import type {
  CreateRoundResponse,
  RoundInternalResponse,
  RoundViewResponse,
} from "@hmk/contracts/rounds";
import type { ServiceApp } from "@hmk/kit";

import type { CreateRound } from "../application/create-round.use-case.ts";
import type { GetRoundInternal } from "../application/get-round-internal.query.ts";
import type { GetRoundView } from "../application/get-round-view.query.ts";

export const roundsRoutes =
  (deps: {
    createRound: Pick<CreateRound, "execute">;
    getRoundView: Pick<GetRoundView, "execute">;
    getRoundInternal: Pick<GetRoundInternal, "execute">;
  }) =>
  (app: ServiceApp): void => {
    app.post("/internal/:code/:n", async (c) => {
      const code = c.req.param("code");
      const n = Number(c.req.param("n"));
      const body = CreateRoundRequest.parse(await c.req.json());

      const result = await deps.createRound.execute({
        gameCode: code,
        hostId: body.hostId,
        impostorMode: body.impostorMode,
        packs: body.packs,
        players: body.players,
        roundNumber: n,
        roundSeconds: body.roundSeconds,
      });

      const responseBody: CreateRoundResponse = { number: result.number };
      return c.json(responseBody, result.alreadyExisted ? 200 : 201);
    });

    app.get("/internal/:code/:n", async (c) => {
      const code = c.req.param("code");
      const n = Number(c.req.param("n"));
      const { user } = c.var;

      const round: RoundInternalResponse = await deps.getRoundInternal.execute({
        gameCode: code,
        playerId: user.id,
        roundNumber: n,
      });

      return c.json(round, 200);
    });

    app.get("/:code/:n", async (c) => {
      const code = c.req.param("code");
      const n = Number(c.req.param("n"));
      const { user } = c.var;

      const view: RoundViewResponse = await deps.getRoundView.execute({
        gameCode: code,
        playerId: user.id,
        roundNumber: n,
      });

      return c.json(view, 200);
    });
  };
