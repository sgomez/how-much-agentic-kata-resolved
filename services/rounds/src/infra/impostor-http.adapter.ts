import { ChooseImpostorResponse } from "@hmk/contracts/impostor";
import type { Candidate, ChooseImpostorRequest } from "@hmk/contracts/impostor";
import type { ServiceClient } from "@hmk/kit";

import type { ImpostorPort } from "../domain/ports/impostor.port.ts";

/** Calls the impostor service over HTTP, forwarding the current player's token. */
export class ImpostorHttpAdapter implements ImpostorPort {
  readonly #client: ServiceClient;

  constructor(client: ServiceClient) {
    this.#client = client;
  }

  async chooseImpostor(
    gameCode: string,
    roundNumber: number,
    candidates: readonly Candidate[],
    hostId: string,
    deadline: Date
  ): Promise<string> {
    const body: ChooseImpostorRequest = {
      candidates: [...candidates],
      deadline: deadline.toISOString(),
      hostId,
    };
    const response = await this.#client.post(
      `/internal/${encodeURIComponent(gameCode)}/${roundNumber}/impostor`,
      body,
      ChooseImpostorResponse
    );
    return response.impostorId;
  }
}
