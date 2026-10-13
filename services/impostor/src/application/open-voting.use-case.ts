import type { Clock } from "../domain/ports/clock.port.ts";
import { RoundNotFoundError } from "../domain/voting.errors.ts";
import type { VotingRepository } from "../domain/voting.repository.ts";

export interface OpenVotingInput {
  gameCode: string;
  round: number;
  userId: string;
}

/** The host opens the voting once the round's deadline has passed. */
export class OpenVoting {
  readonly #votings: VotingRepository;
  readonly #clock: Clock;

  constructor(deps: { votings: VotingRepository; clock: Clock }) {
    this.#votings = deps.votings;
    this.#clock = deps.clock;
  }

  async execute({ gameCode, round, userId }: OpenVotingInput): Promise<void> {
    const voting = await this.#votings.get(gameCode, round);
    if (voting === undefined) {
      throw new RoundNotFoundError(gameCode, round);
    }
    voting.open(userId, this.#clock.now());
    await this.#votings.save(voting);
  }
}
