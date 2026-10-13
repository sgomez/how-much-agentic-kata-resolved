export class RoundNotFoundError extends Error {
  readonly kind = "not-found";
  readonly code = "round-not-found";

  constructor(gameCode: string, roundNumber: number) {
    super(`Round ${roundNumber} of game ${gameCode} does not exist`);
    this.name = "RoundNotFoundError";
  }
}

export class NotAPlayerError extends Error {
  readonly kind = "forbidden";
  readonly code = "not-a-player";

  constructor(playerId: string) {
    super(`Player ${playerId} is not among the players of this round`);
    this.name = "NotAPlayerError";
  }
}

export class WrongRoundNumberError extends Error {
  readonly kind = "conflict";
  readonly code = "wrong-round-number";

  constructor(expected: number, actual: number) {
    super(`Expected round number ${expected}, but got ${actual}`);
    this.name = "WrongRoundNumberError";
  }
}

export class DeckExhaustedError extends Error {
  readonly kind = "conflict";
  readonly code = "deck-exhausted";

  constructor(gameCode: string) {
    super(`Deck exhausted for game ${gameCode}`);
    this.name = "DeckExhaustedError";
  }
}
