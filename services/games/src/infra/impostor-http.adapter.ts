import { VerdictResponse } from "@hmk/contracts/impostor";
import type { Verdict } from "@hmk/contracts/impostor";
import type { ServiceClient } from "@hmk/kit";

import type { ImpostorPort } from "../domain/ports/impostor.port.ts";

/** Calls the impostor service over HTTP, as the current player (the host). */
export class ImpostorHttpAdapter implements ImpostorPort {
  readonly #client: ServiceClient;

  constructor(client: ServiceClient) {
    this.#client = client;
  }

  async verdict(code: string, number: number): Promise<Verdict | null> {
    const { verdict } = await this.#client.get(
      `/internal/${encodeURIComponent(code)}/${number}/verdict`,
      VerdictResponse
    );
    return verdict;
  }
}
