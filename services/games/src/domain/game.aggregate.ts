import {
  GameAlreadyStartedError,
  NotEnoughPlayersError,
  NotTheHostError,
} from "./game.errors.ts";

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

  /** Rebuilds a game as it was stored. */
  static restore(state: {
    code: string;
    host: Player;
    settings: Settings;
    phase: Phase;
    currentRound: number | null;
    players: readonly Player[];
  }): Game {
    const game = new Game(state.code, state.host, state.settings);
    game.#players.splice(0, game.#players.length, ...state.players);
    game.#phase = state.phase;
    game.#currentRound = state.currentRound;
    return game;
  }

  /** Players needed to start: two, or three in impostor mode. */
  get minimumPlayers(): number {
    return this.settings.impostorMode ? 3 : 2;
  }

  /**
   * Checks in this order of precedence.
   * @throws {NotTheHostError} when `playerId` is not the host.
   * @throws {GameAlreadyStartedError} when the game left the lobby.
   * @throws {NotEnoughPlayersError} below the minimum of players.
   */
  assertCanStart(playerId: string): void {
    if (playerId !== this.host.id) {
      throw new NotTheHostError();
    }
    if (this.#phase !== "lobby") {
      throw new GameAlreadyStartedError();
    }
    if (this.#players.length < this.minimumPlayers) {
      throw new NotEnoughPlayersError(this.minimumPlayers);
    }
  }

  /** The host starts the game: it plays round 1. Same errors as `assertCanStart`. */
  start(playerId: string): void {
    this.assertCanStart(playerId);
    this.#phase = "playing";
    this.#currentRound = 1;
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
