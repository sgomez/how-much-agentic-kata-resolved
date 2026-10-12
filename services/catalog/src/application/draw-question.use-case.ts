import { Deck } from "../domain/deck.aggregate.ts";
import { NoQuestionsInPacksError } from "../domain/deck.errors.ts";
import type { DeckRepository } from "../domain/deck.repository.ts";
import { inPacks } from "../domain/packs.ts";
import type { QuestionSource } from "../domain/ports/question-source.port.ts";
import type { Random } from "../domain/ports/random.port.ts";
import type { Question } from "../domain/question.ts";

export interface DrawQuestionInput {
  gameId: string;
  /** Enabled packs; every pack when undefined. */
  packs?: readonly string[] | undefined;
}

/** Draws the next question of a game, never repeating one within that game. */
export class DrawQuestion {
  readonly #decks: DeckRepository;
  readonly #source: QuestionSource;
  readonly #random: Random;

  constructor(deps: {
    decks: DeckRepository;
    source: QuestionSource;
    random: Random;
  }) {
    this.#decks = deps.decks;
    this.#source = deps.source;
    this.#random = deps.random;
  }

  async execute({ gameId, packs }: DrawQuestionInput): Promise<Question> {
    const deck = (await this.#decks.get(gameId)) ?? Deck.start(gameId);
    const pool = inPacks(await this.#source.all(), packs);
    if (packs !== undefined && pool.length === 0) {
      throw new NoQuestionsInPacksError(packs);
    }
    const question = deck.draw(pool, this.#random.next());
    await this.#decks.save(deck);
    return question;
  }
}
