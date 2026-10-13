import {
  AlreadyVotedError,
  InvalidCandidatesError,
  NotAPlayerError,
  NotTheHostError,
  RoundNotRevealedError,
  SelfVoteError,
  UnknownSuspectError,
  VotingNotOpenError,
  VotingOverError,
} from "./voting.errors.ts";

export interface Candidate {
  id: string;
  nickname: string;
}

export type VotingStatus = "pending" | "open" | "over";
export type Verdict = "caught" | "escaped";

const normalise = (nickname: string): string => nickname.trim().toLowerCase();

/**
 * The voting of one round of a game in impostor mode.
 * Invariants: one impostor among the candidates; one final vote per candidate,
 * never for themselves; once over, nothing changes.
 */
export class RoundVoting {
  readonly gameCode: string;
  readonly round: number;
  readonly candidates: readonly Candidate[];
  readonly hostId: string;
  readonly deadline: Date;
  /** Who was chosen. Only Rounds may learn it before the voting is over. */
  readonly chosenImpostorId: string;
  readonly #votes = new Map<string, string>();
  #status: VotingStatus = "pending";

  private constructor(init: {
    gameCode: string;
    round: number;
    candidates: readonly Candidate[];
    hostId: string;
    deadline: Date;
    impostorId: string;
  }) {
    this.gameCode = init.gameCode;
    this.round = init.round;
    this.candidates = init.candidates;
    this.hostId = init.hostId;
    this.deadline = init.deadline;
    this.chosenImpostorId = init.impostorId;
  }

  /**
   * Chooses the impostor of a round.
   * @param roll a random number in [0, 1) that picks the impostor
   */
  static choose(args: {
    gameCode: string;
    round: number;
    candidates: readonly Candidate[];
    hostId: string;
    deadline: Date;
    roll: number;
  }): RoundVoting {
    const { candidates, roll, ...rest } = args;
    if (new Set(candidates.map((c) => c.id)).size !== candidates.length) {
      throw new InvalidCandidatesError("Candidate ids must be unique");
    }
    const index = Math.min(
      Math.floor(roll * candidates.length),
      candidates.length - 1
    );
    const impostor = candidates[index];
    if (candidates.length < 2 || impostor === undefined) {
      throw new InvalidCandidatesError("A round needs at least two candidates");
    }
    return new RoundVoting({ ...rest, candidates, impostorId: impostor.id });
  }

  get status(): VotingStatus {
    return this.#status;
  }

  /** Ids of the candidates who have voted, never who they voted for. */
  get voters(): string[] {
    return [...this.#votes.keys()];
  }

  /** Null until the voting is over. */
  get impostorId(): string | null {
    return this.#status === "over" ? this.chosenImpostorId : null;
  }

  /** Caught only when the impostor alone has the most votes. Null until over. */
  get verdict(): Verdict | null {
    if (this.#status !== "over") {
      return null;
    }
    const tally = new Map<string, number>();
    for (const suspectId of this.#votes.values()) {
      tally.set(suspectId, (tally.get(suspectId) ?? 0) + 1);
    }
    const most = Math.max(0, ...tally.values());
    const leaders = [...tally].filter(([, count]) => count === most);
    const [leader] = leaders;
    return most > 0 &&
      leaders.length === 1 &&
      leader?.[0] === this.chosenImpostorId
      ? "caught"
      : "escaped";
  }

  isCandidate(userId: string): boolean {
    return this.candidates.some((c) => c.id === userId);
  }

  /** Opens the voting. Opening an open voting changes nothing. */
  open(userId: string, now: Date): void {
    this.#requireHost(userId);
    if (this.#status === "over") {
      throw new VotingOverError();
    }
    if (this.#status === "open") {
      return;
    }
    if (now < this.deadline) {
      throw new RoundNotRevealedError();
    }
    this.#status = "open";
  }

  /** Records a final vote. The last candidate's vote ends the voting. */
  cast(voterId: string, suspectNickname: string): void {
    if (!this.isCandidate(voterId)) {
      throw new NotAPlayerError(voterId);
    }
    if (this.#status !== "open") {
      throw new VotingNotOpenError();
    }
    if (this.#votes.has(voterId)) {
      throw new AlreadyVotedError(voterId);
    }
    const suspect = this.candidates.find(
      (c) => normalise(c.nickname) === normalise(suspectNickname)
    );
    if (suspect === undefined) {
      throw new UnknownSuspectError(suspectNickname);
    }
    if (suspect.id === voterId) {
      throw new SelfVoteError();
    }
    this.#votes.set(voterId, suspect.id);
    if (this.#votes.size === this.candidates.length) {
      this.#status = "over";
    }
  }

  /** Ends the voting early. Closing a voting that is over changes nothing. */
  close(userId: string): void {
    this.#requireHost(userId);
    if (this.#status === "over") {
      return;
    }
    if (this.#status === "pending") {
      throw new VotingNotOpenError();
    }
    this.#status = "over";
  }

  #requireHost(userId: string): void {
    if (userId !== this.hostId) {
      throw new NotTheHostError(userId);
    }
  }
}
