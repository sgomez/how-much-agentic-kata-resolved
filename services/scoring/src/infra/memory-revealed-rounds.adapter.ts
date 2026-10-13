import type {
  RevealedRound,
  RevealedRoundsRepository,
} from "../domain/revealed-rounds.repository.ts";

const roundKey = (code: string, round: number): string => `${code}:${round}`;

export class MemoryRevealedRoundsAdapter implements RevealedRoundsRepository {
  private readonly rounds = new Map<string, RevealedRound>();

  get(code: string, round: number): Promise<RevealedRound | null> {
    return Promise.resolve(this.rounds.get(roundKey(code, round)) ?? null);
  }

  save(code: string, revealed: RevealedRound): Promise<void> {
    this.rounds.set(roundKey(code, revealed.number), revealed);
    return Promise.resolve();
  }
}
