import type { Verdict } from "../domain/voting.aggregate.ts";
import { RoundNotFoundError } from "../domain/voting.errors.ts";
import type { VotingRepository } from "../domain/voting.repository.ts";

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
    const voting = await this.#votings.get(gameCode, round);
    if (voting === undefined) {
      throw new RoundNotFoundError(gameCode, round);
    }
    return { impostorId: voting.impostorId, verdict: voting.verdict };
  }
}
