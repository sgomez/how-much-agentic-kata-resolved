import { ChooseImpostorRequest } from "@hmk/contracts/impostor";
import type {
  ChooseImpostorResponse,
  VerdictResponse,
} from "@hmk/contracts/impostor";
import type { ServiceApp } from "@hmk/kit";

import type { ChooseImpostor } from "../application/choose-impostor.use-case.ts";
import type { GetVerdict } from "../application/get-verdict.query.ts";
import { InvalidCandidatesError } from "../domain/voting.errors.ts";
import { roundOf } from "./round-param.ts";

/** The routes other services call: Rounds chooses, Scoring and Games read the verdict. */
export const internalRoutes =
  (deps: {
    chooseImpostor: Pick<ChooseImpostor, "execute">;
    getVerdict: Pick<GetVerdict, "execute">;
  }) =>
  (app: ServiceApp): void => {
    app.post("/internal/:code/:n/impostor", async (c) => {
      const parsed = ChooseImpostorRequest.safeParse(await c.req.json());
      if (!parsed.success) {
        // The contract answers 422 for a bad candidate list; kit maps other bad input to 400.
        if (parsed.error.issues.every((i) => i.path[0] === "candidates")) {
          throw new InvalidCandidatesError(
            "Candidates must be at least two with unique ids"
          );
        }
        throw parsed.error;
      }
      const request = parsed.data;
      const { impostorId, created } = await deps.chooseImpostor.execute({
        candidates: request.candidates,
        deadline: new Date(request.deadline),
        gameCode: c.req.param("code"),
        hostId: request.hostId,
        round: roundOf(c.req.param("n")),
      });
      const body: ChooseImpostorResponse = { impostorId };
      return c.json(body, created ? 201 : 200);
    });

    app.get("/internal/:code/:n/verdict", async (c) => {
      const body: VerdictResponse = await deps.getVerdict.execute(
        c.req.param("code"),
        roundOf(c.req.param("n"))
      );
      return c.json(body);
    });
  };
