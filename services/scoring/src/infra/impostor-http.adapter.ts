import { VerdictResponse } from "@hmk/contracts/impostor";
import type { ServiceClient } from "@hmk/kit";

import type {
  ImpostorPort,
  RoundVerdict,
} from "../domain/ports/impostor.port.ts";

/** Calls the impostor service over HTTP, forwarding the player's bearer token. */
export class ImpostorHttpAdapter implements ImpostorPort {
  readonly #client: ServiceClient;

  constructor(client: ServiceClient) {
    this.#client = client;
  }

  async getVerdict(code: string, round: number): Promise<RoundVerdict> {
    const response = await this.#client.get(
      `/internal/${encodeURIComponent(code)}/${round}/verdict`,
      VerdictResponse
    );
    return {
      impostorId: response.impostorId,
      verdict: response.verdict,
    };
  }
}
