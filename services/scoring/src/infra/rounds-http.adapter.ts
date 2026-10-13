import { RoundInternalResponse } from "@hmk/contracts/rounds";
import { ServiceCallError } from "@hmk/kit";
import type { ServiceClient } from "@hmk/kit";

import type { RoundDetails, RoundsPort } from "../domain/ports/rounds.port.ts";
import { NotAPlayer, RoundNotFound } from "../domain/scoring.errors.ts";

/** Calls the rounds service over HTTP, forwarding the player's bearer token. */
export class RoundsHttpAdapter implements RoundsPort {
  readonly #client: ServiceClient;

  constructor(client: ServiceClient) {
    this.#client = client;
  }

  async getRound(code: string, round: number): Promise<RoundDetails> {
    try {
      return await this.#client.get(
        `/internal/${encodeURIComponent(code)}/${round}`,
        RoundInternalResponse
      );
    } catch (error) {
      if (error instanceof ServiceCallError) {
        if (error.code === "round-not-found") {
          throw new RoundNotFound(round);
        }
        if (error.code === "not-a-player") {
          throw new NotAPlayer();
        }
      }
      throw error;
    }
  }
}
