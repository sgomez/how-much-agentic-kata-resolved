import type { Deck } from "./deck.aggregate.ts";

export interface DeckRepository {
  get: (gameId: string) => Promise<Deck | undefined>;
  save: (deck: Deck) => Promise<void>;
}
