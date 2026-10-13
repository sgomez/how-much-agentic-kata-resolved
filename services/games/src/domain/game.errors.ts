export class NotTheHostError extends Error {
  readonly kind = "forbidden";
  readonly code = "not-the-host";

  constructor() {
    super("Only the host can do this");
    this.name = "NotTheHostError";
  }
}

export class NotEnoughPlayersError extends Error {
  readonly kind = "conflict";
  readonly code = "not-enough-players";

  constructor(minimum: number) {
    super(`A game needs at least ${minimum} players to start`);
    this.name = "NotEnoughPlayersError";
  }
}

export class DeckExhaustedError extends Error {
  readonly kind = "conflict";
  readonly code = "deck-exhausted";

  constructor() {
    super("No question is left to start the game");
    this.name = "DeckExhaustedError";
  }
}

export class UnknownCodeError extends Error {
  readonly kind = "not-found";
  readonly code = "unknown-code";

  constructor(code: string) {
    super(`No game has the code ${code}`);
    this.name = "UnknownCodeError";
  }
}

export class GameAlreadyStartedError extends Error {
  readonly kind = "conflict";
  readonly code = "game-already-started";

  constructor(code: string) {
    super(`Game ${code} has already left the lobby`);
    this.name = "GameAlreadyStartedError";
  }
}

export class NicknameTakenError extends Error {
  readonly kind = "conflict";
  readonly code = "nickname-taken";

  constructor(nickname: string) {
    super(`Another player in the game is already called ${nickname}`);
    this.name = "NicknameTakenError";
  }
}
