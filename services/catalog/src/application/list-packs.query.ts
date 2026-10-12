import { summarizePacks } from "../domain/packs.ts";
import type { PackSummary } from "../domain/packs.ts";
import type { QuestionSource } from "../domain/ports/question-source.port.ts";

/** The question packs a host can enable for a game. */
export class ListPacks {
  readonly #source: QuestionSource;

  constructor(deps: { source: QuestionSource }) {
    this.#source = deps.source;
  }

  async execute(): Promise<PackSummary[]> {
    return summarizePacks(await this.#source.all());
  }
}
