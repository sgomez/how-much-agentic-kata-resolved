import type {
  Candidate,
  Verdict,
  VotingStatus,
} from "../domain/voting.aggregate.ts";
import {
  NotAPlayerError,
  RoundNotFoundError,
} from "../domain/voting.errors.ts";
import type { VotingRepository } from "../domain/voting.repository.ts";

export interface VotingViewOutput {
  voting: VotingStatus;
  candidates: readonly Candidate[];
  voters: string[];
  verdict: Verdict | null;
  impostorId: string | null;
}

/** What a phone of the round sees; never who voted for whom. */
export class GetVotingView {
  readonly #votings: VotingRepository;

  constructor(deps: { votings: VotingRepository }) {
    this.#votings = deps.votings;
  }

  async execute(
    gameCode: string,
    round: number,
    userId: string
  ): Promise<VotingViewOutput> {
    const voting = await this.#votings.get(gameCode, round);
    if (voting === undefined) {
      throw new RoundNotFoundError(gameCode, round);
    }
    if (!voting.isCandidate(userId)) {
      throw new NotAPlayerError(userId);
    }
    return {
      candidates: voting.candidates,
      impostorId: voting.impostorId,
      verdict: voting.verdict,
      voters: voting.voters,
      voting: voting.status,
    };
  }
}
