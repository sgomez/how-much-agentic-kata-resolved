import type { VotingRepository } from "../domain/voting.repository.ts";
import { findVoting } from "./find-voting.ts";

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
    const voting = await findVoting(this.#votings, gameCode, round);
    voting.close(userId);
    await this.#votings.save(voting);
  }
}
