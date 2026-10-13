import type { Random } from "../domain/ports/random.port.ts";
import { RoundVoting } from "../domain/voting.aggregate.ts";
import type { Candidate } from "../domain/voting.aggregate.ts";
import type { VotingRepository } from "../domain/voting.repository.ts";

export interface ChooseImpostorInput {
  gameCode: string;
  round: number;
  candidates: readonly Candidate[];
  hostId: string;
  deadline: Date;
}

export interface ChooseImpostorResult {
  impostorId: string;
  /** False when the round already had an impostor. */
  created: boolean;
}

/** Chooses the impostor of a round; asking again returns the same one. */
export class ChooseImpostor {
  readonly #votings: VotingRepository;
  readonly #random: Random;

  constructor(deps: { votings: VotingRepository; random: Random }) {
    this.#votings = deps.votings;
    this.#random = deps.random;
  }

  async execute(input: ChooseImpostorInput): Promise<ChooseImpostorResult> {
    const existing = await this.#votings.get(input.gameCode, input.round);
    if (existing !== undefined) {
      return { created: false, impostorId: existing.chosenImpostorId };
    }
    const voting = RoundVoting.choose({ ...input, roll: this.#random.next() });
    await this.#votings.save(voting);
    return { created: true, impostorId: voting.chosenImpostorId };
  }
}
