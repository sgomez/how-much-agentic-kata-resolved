import type { Verdict } from "@hmk/contracts/impostor";
import { ServiceCallError } from "@hmk/kit";

import type { ImpostorPort } from "../domain/ports/impostor.port.ts";

/** In-memory impostor for tests: a round it was not told about is a 404, as in the real service. */
export class MemoryImpostor implements ImpostorPort {
  readonly #verdicts = new Map<string, Verdict | null>();

  /** Sets the verdict of a round; null means the voting is not over. */
  setVerdict(code: string, number: number, verdict: Verdict | null): void {
    this.#verdicts.set(`${code}/${number}`, verdict);
  }

  verdict(code: string, number: number): Promise<Verdict | null> {
    const verdict = this.#verdicts.get(`${code}/${number}`);
    if (verdict === undefined) {
      return Promise.reject(
        new ServiceCallError(
          404,
          "round-not-found",
          "No impostor for the round"
        )
      );
    }
    return Promise.resolve(verdict);
  }
}
