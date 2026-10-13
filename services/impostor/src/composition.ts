import { createJwksVerifier } from "@hmk/auth";
import type { TokenVerifier } from "@hmk/auth";
import { createService } from "@hmk/kit";
import type { ServiceApp } from "@hmk/kit";
import { jwksUrl } from "@hmk/kit/topology";

import { CastVote } from "./application/cast-vote.use-case.ts";
import { ChooseImpostor } from "./application/choose-impostor.use-case.ts";
import { CloseVoting } from "./application/close-voting.use-case.ts";
import { GetVerdict } from "./application/get-verdict.query.ts";
import { GetVotingView } from "./application/get-voting-view.query.ts";
import { OpenVoting } from "./application/open-voting.use-case.ts";
import type { Clock } from "./domain/ports/clock.port.ts";
import type { Random } from "./domain/ports/random.port.ts";
import type { VotingRepository } from "./domain/voting.repository.ts";
import { internalRoutes } from "./http/internal.routes.ts";
import { votingRoutes } from "./http/voting.routes.ts";
import { mathRandom } from "./infra/math-random.adapter.ts";
import { MemoryVotingRepository } from "./infra/memory-voting-repository.adapter.ts";
import { systemClock } from "./infra/system-clock.adapter.ts";

export interface ImpostorDeps {
  verifier: TokenVerifier;
  votings?: VotingRepository;
  random?: Random;
  /** Used by the phone routes (opening the voting). */
  clock?: Clock;
  log?: boolean;
}

/** Composition root: the only file that sees every layer. */
export const composeImpostor = ({
  verifier,
  random = mathRandom,
  votings = new MemoryVotingRepository(),
  clock = systemClock,
  log,
}: ImpostorDeps): ServiceApp => {
  const chooseImpostor = new ChooseImpostor({ random, votings });
  const getVerdict = new GetVerdict({ votings });

  return createService({
    log,
    name: "impostor",
    routes: [
      internalRoutes({ chooseImpostor, getVerdict }),
      votingRoutes({
        castVote: new CastVote({ votings }),
        closeVoting: new CloseVoting({ votings }),
        getVotingView: new GetVotingView({ votings }),
        openVoting: new OpenVoting({ clock, votings }),
      }),
    ],
    verifier,
  });
};

/** The service wired with its real adapters, configured from the environment. */
export const composeImpostorFromEnv = (_env: NodeJS.ProcessEnv): ServiceApp =>
  composeImpostor({
    log: true,
    verifier: createJwksVerifier(jwksUrl()),
  });
