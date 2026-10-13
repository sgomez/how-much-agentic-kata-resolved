import type { Question } from "@hmk/contracts/catalog";
import type {
  RoundPhase,
  RoundPlayer,
  RoundViewResponse,
} from "@hmk/contracts/rounds";

import { NotAPlayerError } from "./round.errors.ts";

export interface CreateRoundProps {
  gameCode: string;
  number: number;
  players: readonly RoundPlayer[];
  hostId: string;
  roundSeconds: number;
  impostorMode: boolean;
  question: Question;
  now: Date;
}

export interface RoundProps {
  gameCode: string;
  number: number;
  players: readonly RoundPlayer[];
  hostId: string;
  roundSeconds: number;
  impostorMode: boolean;
  question: Question;
  deadline: Date;
  impostorId?: string | null;
  completed?: boolean;
}

export class Round {
  readonly #gameCode: string;
  readonly #number: number;
  readonly #players: readonly RoundPlayer[];
  readonly #hostId: string;
  readonly #roundSeconds: number;
  readonly #impostorMode: boolean;
  readonly #question: Question;
  readonly #deadline: Date;
  readonly #impostorId: string | null;
  readonly #completed: boolean;

  constructor(props: RoundProps) {
    this.#gameCode = props.gameCode;
    this.#number = props.number;
    this.#players = [...props.players];
    this.#hostId = props.hostId;
    this.#roundSeconds = props.roundSeconds;
    this.#impostorMode = props.impostorMode;
    this.#question = props.question;
    this.#deadline = props.deadline;
    this.#impostorId = props.impostorId ?? null;
    this.#completed = props.completed ?? true;
  }

  static create(props: CreateRoundProps): Round {
    const deadline = new Date(props.now.getTime() + props.roundSeconds * 1000);
    return new Round({
      completed: !props.impostorMode,
      deadline,
      gameCode: props.gameCode,
      hostId: props.hostId,
      impostorMode: props.impostorMode,
      number: props.number,
      players: props.players,
      question: props.question,
      roundSeconds: props.roundSeconds,
    });
  }

  get gameCode(): string {
    return this.#gameCode;
  }

  get number(): number {
    return this.#number;
  }

  get players(): readonly RoundPlayer[] {
    return this.#players;
  }

  get hostId(): string {
    return this.#hostId;
  }

  get roundSeconds(): number {
    return this.#roundSeconds;
  }

  get impostorMode(): boolean {
    return this.#impostorMode;
  }

  get question(): Question {
    return this.#question;
  }

  get deadline(): Date {
    return this.#deadline;
  }

  get impostorId(): string | null {
    return this.#impostorId;
  }

  complete(impostorId: string): Round {
    return new Round({
      completed: true,
      deadline: this.#deadline,
      gameCode: this.#gameCode,
      hostId: this.#hostId,
      impostorId,
      impostorMode: this.#impostorMode,
      number: this.#number,
      players: this.#players,
      question: this.#question,
      roundSeconds: this.#roundSeconds,
    });
  }

  isComplete(): boolean {
    return this.#completed;
  }

  isPlayer(playerId: string): boolean {
    return this.#players.some((p) => p.id === playerId);
  }

  phase(now: Date): RoundPhase {
    return now.getTime() >= this.#deadline.getTime()
      ? "revealed"
      : "estimating";
  }

  viewFor(playerId: string, now: Date): RoundViewResponse {
    if (!this.isPlayer(playerId)) {
      throw new NotAPlayerError(playerId);
    }

    const currentPhase = this.phase(now);
    const isRevealed = currentPhase === "revealed";
    const isImpostor = this.#impostorMode && playerId === this.#impostorId;

    return {
      deadline: this.#deadline.toISOString(),
      isImpostor,
      max: this.#question.max,
      min: this.#question.min,
      number: this.#number,
      phase: currentPhase,
      question: isImpostor ? null : this.#question.text,
      roundSeconds: this.#roundSeconds,
      serverNow: now.toISOString(),
      solution: isRevealed ? this.#question.solution : null,
      unit: this.#question.unit,
    };
  }
}
