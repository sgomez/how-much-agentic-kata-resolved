export interface Player {
  readonly id: string;
  readonly nickname: string;
}

export type Phase = "lobby" | "playing" | "finished";

export interface Settings {
  /** Packs to draw questions from; empty means every pack. */
  readonly packs: readonly string[];
  readonly roundSeconds: number;
  readonly rounds: number;
  readonly impostorMode: boolean;
}

/**
 * One game, from its code to its final ranking.
 * Invariants: the host is the first player and never changes; the settings
 * never change; a game in the lobby has no current round.
 */
export class Game {
  readonly code: string;
  readonly host: Player;
  readonly settings: Settings;
  #phase: Phase = "lobby";
  #currentRound: number | null = null;
  readonly #players: Player[];

  private constructor(code: string, host: Player, settings: Settings) {
    this.code = code;
    this.host = host;
    this.settings = settings;
    this.#players = [host];
  }

  /** A game in the lobby whose only player is its host. */
  static create(code: string, host: Player, settings: Settings): Game {
    return new Game(code, host, settings);
  }

  get phase(): Phase {
    return this.#phase;
  }

  /** The round the game is on; null while it is in the lobby. */
  get currentRound(): number | null {
    return this.#currentRound;
  }

  /** In the order they joined. */
  get players(): readonly Player[] {
    return [...this.#players];
  }
}
