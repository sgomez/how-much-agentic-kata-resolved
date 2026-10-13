import { RoundNotFoundError } from "../domain/voting.errors.ts";
import type { VotingRepository } from "../domain/voting.repository.ts";

export interface CloseVotingInput {
  gameCode: string;
  round: number;
  userId: string;
}

/** The host ends the voting even if someone has not voted. */
export class CloseVoting {
  readonly #votings: VotingRepository;

  constructor(deps: { votings: VotingRepository }) {
    this.#votings = deps.votings;
  }

  async execute({ gameCode, round, userId }: CloseVotingInput): Promise<void> {
    const voting = await this.#votings.get(gameCode, round);
    if (voting === undefined) {
      throw new RoundNotFoundError(gameCode, round);
    }
    voting.close(userId);
    await this.#votings.save(voting);
  }
}
