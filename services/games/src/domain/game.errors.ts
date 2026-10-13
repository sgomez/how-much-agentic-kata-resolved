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
