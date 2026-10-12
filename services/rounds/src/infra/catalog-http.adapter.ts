import { DrawQuestionResponse } from "@hmk/contracts/catalog";
import type { DrawQuestionRequest, Question } from "@hmk/contracts/catalog";
import type { ServiceClient } from "@hmk/kit";

import type { CatalogPort } from "../domain/ports/catalog.port.ts";

/** Calls the catalog service over HTTP, as the current player. */
export class CatalogHttpAdapter implements CatalogPort {
  readonly #client: ServiceClient;

  constructor(client: ServiceClient) {
    this.#client = client;
  }

  async drawQuestion(
    gameId: string,
    packs?: readonly string[]
  ): Promise<Question> {
    // The catalog rejects an empty list, so an empty list means every pack.
    const body: DrawQuestionRequest =
      packs === undefined || packs.length === 0 ? {} : { packs: [...packs] };
    const { question } = await this.#client.post(
      `/decks/${encodeURIComponent(gameId)}/draws`,
      body,
      DrawQuestionResponse
    );
    return question;
  }
}
