import type { RoundVoting } from "../domain/voting.aggregate.ts";
import type { VotingRepository } from "../domain/voting.repository.ts";

export class MemoryVotingRepository implements VotingRepository {
  readonly #votings = new Map<string, RoundVoting>();

  get(gameCode: string, round: number): Promise<RoundVoting | undefined> {
    return Promise.resolve(
      this.#votings.get(MemoryVotingRepository.#key(gameCode, round))
    );
  }

  save(voting: RoundVoting): Promise<void> {
    this.#votings.set(
      MemoryVotingRepository.#key(voting.gameCode, voting.round),
      voting
    );
    return Promise.resolve();
  }

  static #key(gameCode: string, round: number): string {
    return `${gameCode}:${String(round)}`;
  }
}
