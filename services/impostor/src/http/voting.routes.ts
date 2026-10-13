import { CastVoteRequest } from "@hmk/contracts/impostor";
import type { VotingView } from "@hmk/contracts/impostor";
import type { ServiceApp } from "@hmk/kit";

import type { CastVote } from "../application/cast-vote.use-case.ts";
import type { CloseVoting } from "../application/close-voting.use-case.ts";
import type { GetVotingView } from "../application/get-voting-view.query.ts";
import type { OpenVoting } from "../application/open-voting.use-case.ts";

/** A non-numeric round never exists: 0 is answered as an unknown round. */
const roundOf = (n: string): number => (/^\d+$/u.test(n) ? Number(n) : 0);

export const votingRoutes =
  (deps: {
    getVotingView: Pick<GetVotingView, "execute">;
    openVoting: Pick<OpenVoting, "execute">;
    castVote: Pick<CastVote, "execute">;
    closeVoting: Pick<CloseVoting, "execute">;
  }) =>
  (app: ServiceApp): void => {
    app.get("/:code/:n", async (c) => {
      const view = await deps.getVotingView.execute(
        c.req.param("code"),
        roundOf(c.req.param("n")),
        c.var.user.id
      );
      const body: VotingView = { ...view, candidates: [...view.candidates] };
      return c.json(body);
    });

    app.post("/:code/:n/voting", async (c) => {
      await deps.openVoting.execute({
        gameCode: c.req.param("code"),
        round: roundOf(c.req.param("n")),
        userId: c.var.user.id,
      });
      return c.body(null, 204);
    });

    app.post("/:code/:n/votes", async (c) => {
      const { suspectNickname } = CastVoteRequest.parse(await c.req.json());
      await deps.castVote.execute({
        gameCode: c.req.param("code"),
        round: roundOf(c.req.param("n")),
        suspectNickname,
        userId: c.var.user.id,
      });
      return c.body(null, 204);
    });

    app.post("/:code/:n/voting/close", async (c) => {
      await deps.closeVoting.execute({
        gameCode: c.req.param("code"),
        round: roundOf(c.req.param("n")),
        userId: c.var.user.id,
      });
      return c.body(null, 204);
    });
  };
