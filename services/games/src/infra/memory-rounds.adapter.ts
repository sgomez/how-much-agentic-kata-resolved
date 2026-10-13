import type { CreateRoundRequest } from "@hmk/contracts/rounds";

import type { RoundsPort } from "../domain/ports/rounds.port.ts";

/** In-memory rounds for tests: records the rounds asked for, and can be made to fail. */
export class MemoryRounds implements RoundsPort {
  readonly created: {
    code: string;
    number: number;
    request: CreateRoundRequest;
  }[] = [];
  #failure: Error | undefined;

  /** Makes every later `createRound` fail with `error`. */
  failWith(error: Error): void {
    this.#failure = error;
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
}
