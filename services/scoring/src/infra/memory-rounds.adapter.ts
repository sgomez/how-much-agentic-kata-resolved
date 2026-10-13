import type { RoundDetails, RoundsPort } from "../domain/ports/rounds.port.ts";
import { RoundNotFound } from "../domain/scoring.errors.ts";

export class MemoryRoundsAdapter implements RoundsPort {
  readonly #rounds = new Map<string, RoundDetails>();
  readonly #errors = new Map<string, Error>();

  setRound(code: string, details: RoundDetails): void {
    this.#rounds.set(`${code}:${details.number}`, details);
  }

  setError(code: string, round: number, error: Error): void {
    this.#errors.set(`${code}:${round}`, error);
  }

  getRound(code: string, round: number): Promise<RoundDetails> {
    const error = this.#errors.get(`${code}:${round}`);
    if (error) {
      return Promise.reject(error);
    }
    const details = this.#rounds.get(`${code}:${round}`);
    if (!details) {
      return Promise.reject(new RoundNotFound(round));
    }
    return Promise.resolve(details);
  }
}
