import type { GamePhase } from "@hmk/contracts/games";

import {
  GameAlreadyStartedError,
  GameNotStartedError,
  NicknameTakenError,
  NotEnoughPlayersError,
  NotTheHostError,
  WrongRoundError,
} from "./game.errors.ts";

export interface Player {
  readonly id: string;
  readonly nickname: string;
}

export type Phase = GamePhase;

export interface Settings {
  /** Packs to draw questions from; empty means every pack. */
  readonly packs: readonly string[];
  readonly roundSeconds: number;
  readonly rounds: number;
  readonly impostorMode: boolean;
}

const normalise = (nickname: string): string => nickname.trim().toLowerCase();

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
      throw new GameAlreadyStartedError(this.code);
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

  /**
   * Whether the host moving on from `round` changes anything: false once the
   * game has moved on from it or finished (a double click, a retry).
   * @throws {NotTheHostError} when `playerId` is not the host.
   * @throws {GameNotStartedError} in the lobby.
   * @throws {WrongRoundError} when `round` is ahead of the current round.
   */
  canMoveOn(playerId: string, round: number): boolean {
    if (playerId !== this.host.id) {
      throw new NotTheHostError();
    }
    if (this.#currentRound === null) {
      throw new GameNotStartedError(this.code);
    }
    if (round > this.#currentRound) {
      throw new WrongRoundError(round);
    }
    return this.#phase === "playing" && round === this.#currentRound;
  }

  /**
   * The game moves on from `round`: it plays the next round when rounds has
   * created it, and finishes after the last round or when no round was
   * created (the deck is exhausted). Nothing changes when it has already moved
   * on from `round`.
   */
  moveOn(round: number, nextRoundCreated: boolean): void {
    if (this.#phase !== "playing" || this.#currentRound !== round) {
      return;
    }
    if (nextRoundCreated && !this.isLastRound(round)) {
      this.#currentRound = round + 1;
    } else {
      this.#phase = "finished";
    }
  }

  /** True when `round` is the last one the host asked for. */
  isLastRound(round: number): boolean {
    return round >= this.settings.rounds;
  }

  get phase(): Phase {
    return this.#phase;
  }

  /** The round the game is on; null while it is in the lobby. */
  get currentRound(): number | null {
    return this.#currentRound;
  }

  /**
   * Adds the player at the end of the line; a player already in is left alone.
   * @throws {GameAlreadyStartedError} when a new player comes once the game has left the lobby
   * @throws {NicknameTakenError} when another player has the nickname, ignoring case and spaces at either end
   */
  join(player: Player): void {
    if (this.#players.some(({ id }) => id === player.id)) {
      return;
    }
    if (this.#phase !== "lobby") {
      throw new GameAlreadyStartedError(this.code);
    }
    const normalised = normalise(player.nickname);
    if (
      this.#players.some(({ nickname }) => normalise(nickname) === normalised)
    ) {
      throw new NicknameTakenError(player.nickname);
    }
    this.#players.push(player);
  }

  /** In the order they joined. */
  get players(): readonly Player[] {
    return [...this.#players];
  }
}
