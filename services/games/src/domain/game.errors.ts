export class UnknownCodeError extends Error {
  readonly kind = "not-found";
  readonly code = "unknown-code";

  constructor(code: string) {
    super(`No game has the code ${code}`);
    this.name = "UnknownCodeError";
  }
}
