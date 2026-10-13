import type { Candidate } from "@hmk/contracts/impostor";

import type { ImpostorPort } from "../domain/ports/impostor.port.ts";

export interface ChooseImpostorCall {
  gameCode: string;
  roundNumber: number;
  candidates: readonly Candidate[];
  hostId: string;
  deadline: Date;
}

/** In-memory impostor adapter for tests. */
export class MemoryImpostorAdapter implements ImpostorPort {
  readonly calls: ChooseImpostorCall[] = [];
  #impostorId: string | ((call: ChooseImpostorCall) => string);
  #error: Error | null = null;

  constructor(
    impostorIdOrPicker:
      | string
      | ((call: ChooseImpostorCall) => string) = "impostor-id"
  ) {
    this.#impostorId = impostorIdOrPicker;
  }

  setError(error: Error | null): void {
    this.#error = error;
  }

  setImpostorId(
    impostorIdOrPicker: string | ((call: ChooseImpostorCall) => string)
  ): void {
    this.#impostorId = impostorIdOrPicker;
  }

  chooseImpostor(
    gameCode: string,
    roundNumber: number,
    candidates: readonly Candidate[],
    hostId: string,
    deadline: Date
  ): Promise<string> {
    const call: ChooseImpostorCall = {
      candidates: [...candidates],
      deadline,
      gameCode,
      hostId,
      roundNumber,
    };
    this.calls.push(call);

    if (this.#error) {
      return Promise.reject(this.#error);
    }

    const impostorId =
      typeof this.#impostorId === "function"
        ? this.#impostorId(call)
        : this.#impostorId;
    return Promise.resolve(impostorId);
  }
}
