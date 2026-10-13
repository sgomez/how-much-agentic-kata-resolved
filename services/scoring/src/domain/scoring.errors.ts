export class OutOfRangeError extends Error {
  readonly kind = "invalid";
  readonly code = "out-of-range";

  constructor(value: number, min: number, max: number) {
    super(`Estimate ${value} is outside ruler range [${min}, ${max}]`);
    this.name = "OutOfRangeError";
  }
}
export { OutOfRangeError as OutOfRange };

export class RoundRevealedError extends Error {
  readonly kind = "conflict";
  readonly code = "round-revealed";

  constructor(round: number) {
    super(`Round ${round} is already revealed`);
    this.name = "RoundRevealedError";
  }
}
export { RoundRevealedError as RoundRevealed };

export class RoundNotFoundError extends Error {
  readonly kind = "not-found";
  readonly code = "round-not-found";

  constructor(round: number) {
    super(`Round ${round} not found`);
    this.name = "RoundNotFoundError";
  }
}
export { RoundNotFoundError as RoundNotFound };

export class NotAPlayerError extends Error {
  readonly kind = "forbidden";
  readonly code = "not-a-player";

  constructor() {
    super("Player is not part of this round");
    this.name = "NotAPlayerError";
  }
}
export { NotAPlayerError as NotAPlayer };

export class RoundNotRevealedError extends Error {
  readonly kind = "conflict";
  readonly code = "round-not-revealed";

  constructor(round: number) {
    super(`Round ${round} is not revealed yet`);
    this.name = "RoundNotRevealedError";
  }
}
export { RoundNotRevealedError as RoundNotRevealed };

export class UnknownCodeError extends Error {
  readonly kind = "not-found";
  readonly code = "unknown-code";

  constructor(code: string) {
    super(`Game ${code} not found`);
    this.name = "UnknownCodeError";
  }
}
export { UnknownCodeError as UnknownCode };
