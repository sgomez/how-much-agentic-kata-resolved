export class RoundNotFoundError extends Error {
  readonly kind = "not-found";
  readonly code = "round-not-found";

  constructor(gameCode: string, round: number) {
    super(`No impostor for round ${String(round)} of game ${gameCode}`);
    this.name = "RoundNotFoundError";
  }
}

export class NotAPlayerError extends Error {
  readonly kind = "forbidden";
  readonly code = "not-a-player";

  constructor(userId: string) {
    super(`User ${userId} is not a candidate of this round`);
    this.name = "NotAPlayerError";
  }
}

export class NotTheHostError extends Error {
  readonly kind = "forbidden";
  readonly code = "not-the-host";

  constructor(userId: string) {
    super(`User ${userId} is not the host of this round`);
    this.name = "NotTheHostError";
  }
}

export class RoundNotRevealedError extends Error {
  readonly kind = "conflict";
  readonly code = "round-not-revealed";

  constructor() {
    super("The round has not reached its deadline yet");
    this.name = "RoundNotRevealedError";
  }
}

export class VotingOverError extends Error {
  readonly kind = "conflict";
  readonly code = "voting-over";

  constructor() {
    super("The voting is already over");
    this.name = "VotingOverError";
  }
}

export class VotingNotOpenError extends Error {
  readonly kind = "conflict";
  readonly code = "voting-not-open";

  constructor() {
    super("The voting is not open");
    this.name = "VotingNotOpenError";
  }
}

export class AlreadyVotedError extends Error {
  readonly kind = "conflict";
  readonly code = "already-voted";

  constructor(userId: string) {
    super(`User ${userId} has already voted`);
    this.name = "AlreadyVotedError";
  }
}

export class ImpostorCannotVoteError extends Error {
  readonly kind = "forbidden";
  readonly code = "impostor-cannot-vote";

  constructor() {
    super("The impostor of the round does not vote");
    this.name = "ImpostorCannotVoteError";
  }
}

export class SelfVoteError extends Error {
  readonly kind = "invalid";
  readonly code = "self-vote";

  constructor() {
    super("Nobody can vote for themselves");
    this.name = "SelfVoteError";
  }
}

export class UnknownSuspectError extends Error {
  readonly kind = "invalid";
  readonly code = "unknown-suspect";

  constructor(nickname: string) {
    super(`No candidate is called ${nickname}`);
    this.name = "UnknownSuspectError";
  }
}

export class InvalidCandidatesError extends Error {
  readonly kind = "invalid";
  readonly code = "invalid-candidates";

  constructor(reason: string) {
    super(reason);
    this.name = "InvalidCandidatesError";
  }
}
