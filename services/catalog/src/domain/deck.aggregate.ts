import { DeckExhaustedError } from "./deck.errors.ts";
import type { Question } from "./question.ts";

/**
 * The questions already drawn for one game.
 * Invariant: a game never draws the same question twice.
 */
export class Deck {
  readonly gameId: string;
  readonly #drawn: Set<string>;

  private constructor(gameId: string, drawn: Iterable<string>) {
    this.gameId = gameId;
    this.#drawn = new Set(drawn);
  }

  /** A deck for a game that has not drawn anything yet. */
  static start(gameId: string): Deck {
    return new Deck(gameId, []);
  }

  get drawnCount(): number {
    return this.#drawn.size;
  }

  /**
   * Draws one question this game has not seen yet.
   * @param pool the questions of the game's enabled packs
   * @param roll a random number in [0, 1) that picks among the remaining ones
   */
  draw(pool: readonly Question[], roll: number): Question {
    const remaining = pool.filter((question) => !this.#drawn.has(question.id));
    const index = Math.min(
      Math.floor(roll * remaining.length),
      remaining.length - 1
    );
    const question = remaining[index];
    if (question === undefined) {
      throw new DeckExhaustedError(this.gameId);
    }
    this.#drawn.add(question.id);
    return question;
  }
}
