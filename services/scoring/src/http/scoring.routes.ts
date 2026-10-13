import { SendEstimateRequest } from "@hmk/contracts/scoring";
import type {
  ListEstimatesResponse,
  SendEstimateResponse,
} from "@hmk/contracts/scoring";
import type { ServiceApp } from "@hmk/kit";

import type { ListEstimates } from "../application/list-estimates.query.ts";
import type { SendEstimate } from "../application/send-estimate.use-case.ts";

export const scoringRoutes =
  (deps: {
    sendEstimate: Pick<SendEstimate, "execute">;
    listEstimates: Pick<ListEstimates, "execute">;
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

      const player =
        (c.var as unknown as { player?: { id: string }; user?: { id: string } })
          .player ?? c.var.user;
      const playerId = player.id;

      const stored = await deps.sendEstimate.execute({
        code,
        round,
        playerId,
        value,
      });

      const body: SendEstimateResponse = { value: stored };
      return c.json(body, 200);
    });

    app.get("/:code/:n/estimates", async (c) => {
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

      const player =
        (c.var as unknown as { player?: { id: string }; user?: { id: string } })
          .player ?? c.var.user;
      const playerId = player.id;

      const result = await deps.listEstimates.execute({
        code,
        round,
        playerId,
      });

      const body: ListEstimatesResponse = result;
      return c.json(body, 200);
    });
  };
