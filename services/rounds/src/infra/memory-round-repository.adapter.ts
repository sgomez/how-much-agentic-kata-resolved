import type { Round } from "../domain/round.aggregate.ts";
import type { RoundRepository } from "../domain/round.repository.ts";

export class MemoryRoundRepository implements RoundRepository {
  readonly #roundsByGame = new Map<string, Map<number, Round>>();

  findByGameAndNumber(
    gameCode: string,
    roundNumber: number
  ): Promise<Round | null> {
    const rounds = this.#roundsByGame.get(gameCode);
    const round = rounds?.get(roundNumber) ?? null;
    return Promise.resolve(round);
  }

  findLastByGame(gameCode: string): Promise<Round | null> {
    const rounds = this.#roundsByGame.get(gameCode);
    if (!rounds || rounds.size === 0) {
      return Promise.resolve(null);
    }
    let maxNumber = -1;
    let lastRound: Round | null = null;
    for (const [number, round] of rounds.entries()) {
      if (number > maxNumber) {
        maxNumber = number;
        lastRound = round;
      }
    }
    return Promise.resolve(lastRound);
  }

  save(round: Round): Promise<void> {
    let rounds = this.#roundsByGame.get(round.gameCode);
    if (!rounds) {
      rounds = new Map<number, Round>();
      this.#roundsByGame.set(round.gameCode, rounds);
    }
    rounds.set(round.number, round);
    return Promise.resolve();
  }
}
