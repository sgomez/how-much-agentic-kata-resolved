import { ListPlayersResponse } from "@hmk/contracts/games";
import { ServiceCallError } from "@hmk/kit";
import type { ServiceClient } from "@hmk/kit";

import type { GameInfo, GamesPort } from "../domain/ports/games.port.ts";
import { UnknownCode } from "../domain/scoring.errors.ts";

/** Calls the games service over HTTP, forwarding the player's bearer token. */
export class GamesHttpAdapter implements GamesPort {
  readonly #client: ServiceClient;

  constructor(client: ServiceClient) {
    this.#client = client;
  }

  async getGame(code: string): Promise<GameInfo> {
    try {
      const response = await this.#client.get(
        `/internal/${encodeURIComponent(code)}/players`,
        ListPlayersResponse
      );
      return {
        players: response.players,
        impostorMode: response.impostorMode,
      };
    } catch (error) {
      if (error instanceof ServiceCallError && error.code === "unknown-code") {
        throw new UnknownCode(code);
      }
      throw error;
    }
  }
}
