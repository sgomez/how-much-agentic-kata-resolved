import { RoundNotFoundError } from "../domain/voting.errors.ts";
import type { VotingRepository } from "../domain/voting.repository.ts";

export interface CastVoteInput {
  gameCode: string;
  round: number;
  /** The caller's id from the token. */
  userId: string;
  suspectNickname: string;
}

/** A candidate votes for who they think the impostor is. */
export class CastVote {
  readonly #votings: VotingRepository;

  constructor(deps: { votings: VotingRepository }) {
    this.#votings = deps.votings;
  }

  async execute({
    gameCode,
    round,
    userId,
    suspectNickname,
  }: CastVoteInput): Promise<void> {
    const voting = await this.#votings.get(gameCode, round);
    if (voting === undefined) {
      throw new RoundNotFoundError(gameCode, round);
    }
    voting.cast(userId, suspectNickname);
    await this.#votings.save(voting);
  }
}
