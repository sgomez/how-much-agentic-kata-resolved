import type {
  CreateRoundRequest,
  RoundInternalResponse,
} from "@hmk/contracts/rounds";
import { ServiceCallError } from "@hmk/kit";

import type { RoundsPort } from "../domain/ports/rounds.port.ts";

/** In-memory rounds for tests: records the rounds asked for, and can be made to fail. */
export class MemoryRounds implements RoundsPort {
  readonly created: {
    code: string;
    number: number;
    request: CreateRoundRequest;
  }[] = [];
  readonly #known = new Map<string, RoundInternalResponse>();
  #failure: Error | undefined;

  /** Makes every later `createRound` fail with `error`. */
  failWith(error: Error): void {
    this.#failure = error;
  }

  /** Rounds knows round `number`, not revealed yet. */
  add(code: string, number: number): void {
    this.#known.set(`${code}/${number}`, {
      deadline: "2030-01-01T00:00:00.000Z",
      max: 100,
      min: 0,
      number,
      solution: null,
    });
  }

  /** Rounds knows round `number`, revealed with `solution`. */
  reveal(code: string, number: number, solution: number): void {
    this.add(code, number);
    const round = this.#known.get(`${code}/${number}`);
    if (round !== undefined) {
      this.#known.set(`${code}/${number}`, { ...round, solution });
    }
  }

  createRound(
    code: string,
    number: number,
    request: CreateRoundRequest
  ): Promise<void> {
    if (this.#failure !== undefined) {
      return Promise.reject(this.#failure);
    }
    this.created.push({ code, number, request });
    return Promise.resolve();
  }

  getRound(code: string, number: number): Promise<RoundInternalResponse> {
    const round = this.#known.get(`${code}/${number}`);
    if (round === undefined) {
      return Promise.reject(
        new ServiceCallError(404, "round-not-found", "No such round")
      );
    }
    return Promise.resolve(round);
  }
}
