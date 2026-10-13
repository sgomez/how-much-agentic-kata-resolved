import { CastVoteRequest } from "@hmk/contracts/impostor";
import type { VotingView } from "@hmk/contracts/impostor";
import type { ServiceApp } from "@hmk/kit";

import type { CastVote } from "../application/cast-vote.use-case.ts";
import type { CloseVoting } from "../application/close-voting.use-case.ts";
import type { GetVotingView } from "../application/get-voting-view.query.ts";
import type { OpenVoting } from "../application/open-voting.use-case.ts";
import { roundOf } from "./round-param.ts";

/** The game code and round named by the path. */
const roundTarget = (c: { req: { param: (name: string) => string } }) => ({
  gameCode: c.req.param("code"),
  round: roundOf(c.req.param("n")),
});

export const votingRoutes =
  (deps: {
    getVotingView: Pick<GetVotingView, "execute">;
    openVoting: Pick<OpenVoting, "execute">;
    castVote: Pick<CastVote, "execute">;
    closeVoting: Pick<CloseVoting, "execute">;
  }) =>
  (app: ServiceApp): void => {
    app.get("/:code/:n", async (c) => {
      const { gameCode, round } = roundTarget(c);
      const view = await deps.getVotingView.execute(
        gameCode,
        round,
        c.var.user.id
      );
      const body: VotingView = { ...view, candidates: [...view.candidates] };
      return c.json(body);
    });

    app.post("/:code/:n/voting", async (c) => {
      await deps.openVoting.execute({
        ...roundTarget(c),
        userId: c.var.user.id,
      });
      return c.body(null, 204);
    });

    app.post("/:code/:n/votes", async (c) => {
      const { suspectNickname } = CastVoteRequest.parse(await c.req.json());
      await deps.castVote.execute({
        ...roundTarget(c),
        suspectNickname,
        userId: c.var.user.id,
      });
      return c.body(null, 204);
    });

    app.post("/:code/:n/voting/close", async (c) => {
      await deps.closeVoting.execute({
        ...roundTarget(c),
        userId: c.var.user.id,
      });
      return c.body(null, 204);
    });
  };
