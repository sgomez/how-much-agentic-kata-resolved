import type { Question } from "@hmk/contracts/catalog";

import type { CatalogPort } from "../domain/ports/catalog.port.ts";
import { DeckExhaustedError } from "../domain/round.errors.ts";

/** In-memory catalog for tests: hands out the given questions in order. */
export class MemoryCatalog implements CatalogPort {
  readonly #questions: Question[];
  readonly draws: { gameId: string; packs: readonly string[] | undefined }[] =
    [];

  constructor(questions: readonly Question[]) {
    this.#questions = [...questions];
  }

  drawQuestion(gameId: string, packs?: readonly string[]): Promise<Question> {
    this.draws.push({ gameId, packs });
    const question = this.#questions.shift();
    return question === undefined
      ? Promise.reject(new DeckExhaustedError(gameId))
      : Promise.resolve(question);
  }
}
