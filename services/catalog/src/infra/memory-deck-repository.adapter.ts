import type { Deck } from "../domain/deck.aggregate.ts";
import type { DeckRepository } from "../domain/deck.repository.ts";

export class MemoryDeckRepository implements DeckRepository {
  readonly #decks = new Map<string, Deck>();

  get(gameId: string): Promise<Deck | undefined> {
    return Promise.resolve(this.#decks.get(gameId));
  }

  save(deck: Deck): Promise<void> {
    this.#decks.set(deck.gameId, deck);
    return Promise.resolve();
  }
}
