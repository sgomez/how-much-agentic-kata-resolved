// Ports the DSL needs from the running system: one interface per capability.
// Each is implemented in acceptance/drivers/<capability>.ts by the group that owns it.
//
// These describe what a player DOES and SEES, never how services split the work.
// Implement them through the gateway only (player.http), like a phone would.

import type { z } from "zod";

/** Calls `/api/<service>/...` through the gateway as one signed-in player. */
export interface GatewayHttp {
  /** GET and parse a 2xx answer with a contract schema. */
  get: <S extends z.ZodType>(path: string, schema: S) => Promise<z.infer<S>>;
  /** POST and parse a 2xx answer with a contract schema (use `z.unknown()` for 204). */
  post: <S extends z.ZodType>(
    path: string,
    body: unknown,
    schema: S
  ) => Promise<z.infer<S>>;
  /** Raw call, for asserting on error answers. */
  request: (
    method: "GET" | "POST",
    path: string,
    body?: unknown
  ) => Promise<{ status: number; body: unknown }>;
}

/** A signed-in player: one phone, one anonymous user. */
export interface Player {
  /** Name the test uses (`ana`). */
  alias: string;
  /** Nickname the other players see (unique per test run). */
  nickname: string;
  /** Authenticated calls through the gateway, like the web app does. */
  http: GatewayHttp;
}

export interface SessionDriver {
  /** Opens the app on a new phone and picks a nickname. */
  signIn: (alias: string, nickname: string) => Promise<Player>;
}

export interface GameOptions {
  impostor: boolean;
  /** Time players have to estimate. Acceptance tests use short rounds. */
  roundSeconds: number;
}

export type JoinOutcome = "joined" | "unknown-code";

export interface GamesDriver {
  /** The host creates a game; the screen shows its code. */
  createGame: (host: Player, options: GameOptions) => Promise<{ code: string }>;
  /** A player types a game code to join it. */
  join: (player: Player, code: string) => Promise<JoinOutcome>;
  /** Nicknames this player sees in the game's lobby. */
  lobby: (player: Player, code: string) => Promise<string[]>;
  /** The host starts the game. */
  startGame: (host: Player, code: string) => Promise<void>;
  /**
   * The game moves on to the next question. Who triggers it is the games
   * group's decision: the host presses a button, or the driver just waits for
   * the game to advance on its own.
   */
  nextRound: (host: Player, code: string) => Promise<void>;
}

/** What a player's round screen shows. */
export interface RoundView {
  /** 1 for the first question of the game, 2 for the next one... */
  number: number;
  phase: "estimating" | "revealed";
  /** The question text, or null when this player must not see it. */
  question: string | null;
  unit: string;
  /** Range of the estimate ruler. */
  min: number;
  max: number;
  /** This player's own estimate, if they sent one. */
  myEstimate: number | null;
  /** The right answer, only once revealed. */
  solution: number | null;
}

export interface RoundsDriver {
  /**
   * The round on this player's screen, or null while there is none.
   * Some of what the screen shows (such as `myEstimate`) may live in data the
   * rounds group does not own; like the phone, the driver may call any public API.
   */
  currentRound: (player: Player, code: string) => Promise<RoundView | null>;
}

export interface ScoreLine {
  nickname: string;
  points: number;
}

export interface ScoringDriver {
  /** The player sets the ruler and sends their estimate. */
  estimate: (player: Player, code: string, value: number) => Promise<void>;
  /** The scoreboard as this player sees it. */
  scoreboard: (player: Player, code: string) => Promise<ScoreLine[]>;
}

export interface ImpostorDriver {
  /**
   * The game moves on from the reveal to the vote. Who triggers it (the host
   * presses a button, or the driver just waits for it) is the impostor
   * group's decision.
   */
  openVoting: (host: Player, code: string) => Promise<void>;
  /** After the reveal, a player votes for who they think the impostor is. */
  vote: (
    player: Player,
    code: string,
    suspectNickname: string
  ) => Promise<void>;
  /** Whether this player's screen shows the vote as finished. */
  votingIsOver: (player: Player, code: string) => Promise<boolean>;
}

/** A question the next draw will return (test mode only). */
export interface RiggedQuestion {
  id: string;
  text: string;
  unit: string;
  solution: number;
  pack: string;
  min: number;
  max: number;
}

export interface CatalogDriver {
  /** Makes the next question drawn, by any game, this one. */
  rigNextQuestion: (player: Player, question: RiggedQuestion) => Promise<void>;
  /** Packs a host could choose from. */
  packs: (player: Player) => Promise<string[]>;
}

export interface Drivers {
  session: SessionDriver;
  games: GamesDriver;
  rounds: RoundsDriver;
  scoring: ScoringDriver;
  impostor: ImpostorDriver;
  catalog: CatalogDriver;
}
