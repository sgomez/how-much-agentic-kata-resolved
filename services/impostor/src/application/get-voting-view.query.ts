import type {
  Candidate,
  Verdict,
  VotingStatus,
} from "../domain/voting.aggregate.ts";
import { NotAPlayerError } from "../domain/voting.errors.ts";
import type { VotingRepository } from "../domain/voting.repository.ts";
import { findVoting } from "./find-voting.ts";

export interface VotingViewOutput {
  voting: VotingStatus;
  candidates: readonly Candidate[];
  voters: string[];
  verdict: Verdict | null;
  impostorId: string | null;
}

/**
 * What a phone of the round sees; never who voted for whom. `voters` holds at
 * most the caller: the one who never votes is the impostor.
 */
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
    const voting = await findVoting(this.#votings, gameCode, round);
    if (!voting.isCandidate(userId)) {
      throw new NotAPlayerError(userId);
    }
    return {
      candidates: voting.candidates,
      impostorId: voting.impostorId,
      verdict: voting.verdict,
      voters: voting.voters.filter((id) => id === userId),
      voting: voting.status,
    };
  }
}
