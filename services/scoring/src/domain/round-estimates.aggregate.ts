import type { PlayerEstimate } from "./scoring-rules.ts";
import { OutOfRange, RoundRevealed } from "./scoring.errors.ts";

export interface RecordEstimateInput {
  playerId: string;
  value: number;
  min: number;
  max: number;
  solution: number | null;
}

/**
 * Keeps estimates of a round: at most one per player, a new one replaces the previous.
 * Invariants:
 * - accepts estimate only while round is estimating (solution === null)
 * - accepts estimate only within [min, max] bounds (bounds included)
 */
export class RoundEstimates {
  readonly code: string;
  readonly round: number;
  readonly #estimates: Map<string, number>;

  constructor(
    code: string,
    round: number,
    initial?: Iterable<[string, number]>
  ) {
    this.code = code;
    this.round = round;
    this.#estimates = new Map(initial);
  }

  static start(code: string, round: number): RoundEstimates {
    return new RoundEstimates(code, round);
  }

  record({ playerId, value, min, max, solution }: RecordEstimateInput): number {
    if (solution !== null) {
      throw new RoundRevealed(this.round);
    }
    if (value < min || value > max) {
      throw new OutOfRange(value, min, max);
    }
    this.#estimates.set(playerId, value);
    return value;
  }

  getEstimate(playerId: string): number | null {
    return this.#estimates.get(playerId) ?? null;
  }

  answeredPlayers(): string[] {
    return [...this.#estimates.keys()];
  }

  allEstimates(): PlayerEstimate[] {
    return [...this.#estimates.entries()].map(([playerId, value]) => ({
      playerId,
      value,
    }));
  }
}
