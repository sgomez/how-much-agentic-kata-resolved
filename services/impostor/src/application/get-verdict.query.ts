import type { Verdict } from "../domain/voting.aggregate.ts";
import type { VotingRepository } from "../domain/voting.repository.ts";
import { findVoting } from "./find-voting.ts";

export interface VerdictOutput {
  verdict: Verdict | null;
  impostorId: string | null;
}

/** The verdict and the impostor of a round; both null until the voting is over. */
export class GetVerdict {
  readonly #votings: VotingRepository;

  constructor(deps: { votings: VotingRepository }) {
    this.#votings = deps.votings;
  }

  async execute(gameCode: string, round: number): Promise<VerdictOutput> {
    const voting = await findVoting(this.#votings, gameCode, round);
    return { impostorId: voting.impostorId, verdict: voting.verdict };
  }
}
