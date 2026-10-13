import { CreateRoundResponse } from "@hmk/contracts/rounds";
import type { CreateRoundRequest } from "@hmk/contracts/rounds";
import { ServiceCallError } from "@hmk/kit";
import type { ServiceClient } from "@hmk/kit";

import { DeckExhaustedError } from "../domain/game.errors.ts";
import type { RoundsPort } from "../domain/ports/rounds.port.ts";

/** Calls the rounds service over HTTP, as the current player (the host). */
export class RoundsHttpAdapter implements RoundsPort {
  readonly #client: ServiceClient;

  constructor(client: ServiceClient) {
    this.#client = client;
  }

  async createRound(
    code: string,
    number: number,
    request: CreateRoundRequest
  ): Promise<void> {
    try {
      await this.#client.post(
        `/internal/${encodeURIComponent(code)}/${number}`,
        request,
        CreateRoundResponse
      );
    } catch (error) {
      if (
        error instanceof ServiceCallError &&
        error.code === "deck-exhausted"
      ) {
        throw new DeckExhaustedError();
      }
      throw error;
    }
  }
}
