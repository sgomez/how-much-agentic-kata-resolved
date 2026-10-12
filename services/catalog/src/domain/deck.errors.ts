export class DeckExhaustedError extends Error {
  readonly kind = "conflict";
  readonly code = "deck-exhausted";

  constructor(gameId: string) {
    super(`Game ${gameId} has already drawn every question in its packs`);
    this.name = "DeckExhaustedError";
  }
}

export class NoQuestionsInPacksError extends Error {
  readonly kind = "invalid";
  readonly code = "no-questions-in-packs";

  constructor(packs: readonly string[]) {
    super(`No questions in packs: ${packs.join(", ")}`);
    this.name = "NoQuestionsInPacksError";
  }
}
