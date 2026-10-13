import { SendEstimateRequest } from "@hmk/contracts/scoring";
import type {
  ListEstimatesResponse,
  RevealResponse,
  ScoreboardResponse,
  SendEstimateResponse,
} from "@hmk/contracts/scoring";
import type { ServiceApp } from "@hmk/kit";

import type { GetRevealQuery } from "../application/get-reveal.query.ts";
import type { GetScoreboardQuery } from "../application/get-scoreboard.query.ts";
import type { ListEstimates } from "../application/list-estimates.query.ts";
import type { SendEstimate } from "../application/send-estimate.use-case.ts";

export const scoringRoutes =
  (deps: {
    sendEstimate: Pick<SendEstimate, "execute">;
    listEstimates: Pick<ListEstimates, "execute">;
    getScoreboard: Pick<GetScoreboardQuery, "execute">;
    getReveal: Pick<GetRevealQuery, "execute">;
  }) =>
  (app: ServiceApp): void => {
    app.post("/:code/:n/estimates", async (c) => {
      const code = c.req.param("code");
      const round = Math.trunc(Number(c.req.param("n")));
      if (!Number.isInteger(round) || round <= 0) {
        return c.json(
          {
            error: { code: "invalid-request", message: "Invalid round number" },
          },
          400
        );
      }

      let raw: unknown;
      try {
        raw = await c.req.json();
      } catch {
        return c.json(
          { error: { code: "invalid-request", message: "Invalid JSON body" } },
          400
        );
      }

      const { value } = SendEstimateRequest.parse(raw);
      const playerId = c.var.user.id;

      const stored = await deps.sendEstimate.execute({
        code,
        playerId,
        round,
        value,
      });

      const body: SendEstimateResponse = { value: stored };
      return c.json(body, 200);
    });

    app.get("/:code/:n/estimates", async (c) => {
      const code = c.req.param("code");
      const round = Math.trunc(Number(c.req.param("n")));
      if (!Number.isInteger(round) || round <= 0) {
        const empty: ListEstimatesResponse = { answered: [], myEstimate: null };
        return c.json(empty, 200);
      }

      const playerId = c.var.user.id;

      const result = await deps.listEstimates.execute({
        code,
        playerId,
        round,
      });

      const body: ListEstimatesResponse = result;
      return c.json(body, 200);
    });

    app.get("/:code/scoreboard", async (c) => {
      const code = c.req.param("code");
      const playerId = c.var.user.id;

      const result = await deps.getScoreboard.execute(code, playerId);

      const body: ScoreboardResponse = result;
      return c.json(body, 200);
    });

    app.get("/:code/:n/reveal", async (c) => {
      const code = c.req.param("code");
      const round = Math.trunc(Number(c.req.param("n")));
      if (!Number.isInteger(round) || round <= 0) {
        return c.json(
          {
            error: { code: "invalid-request", message: "Invalid round number" },
          },
          400
        );
      }

      const playerId = c.var.user.id;

      const result = await deps.getReveal.execute({
        askingPlayerId: playerId,
        code,
        round,
      });

      const body: RevealResponse = result;
      return c.json(body, 200);
    });
  };
