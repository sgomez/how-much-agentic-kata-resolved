import type { Clock } from "../domain/ports/clock.port.ts";
import type { VotingRepository } from "../domain/voting.repository.ts";
import { findVoting } from "./find-voting.ts";

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
    const voting = await findVoting(this.#votings, gameCode, round);
    voting.open(userId, this.#clock.now());
    await this.#votings.save(voting);
  }
}
