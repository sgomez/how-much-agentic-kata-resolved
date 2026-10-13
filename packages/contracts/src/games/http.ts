import { z } from "zod";

// HTTP contract of the games service.
//
// The player is never in a body: every route reads `{ id, name }` from the
// token (`packages/auth`). `id` identifies the player in every service and
// `name` is the nickname they joined with. `/internal` routes also need the
// token: the calling service forwards the one of the player who started the
// request.

/** Error codes the games service answers with, inside `ErrorBody` (`@hmk/contracts`). */
export const GamesErrorCode = z.enum([
  /** 404: no game has this code. */
  "unknown-code",
  /** 409: joining or starting a game that has already left the lobby. */
  "game-already-started",
  /** 409: another player in the game already has this nickname (ignoring case and spaces at either end). */
  "nickname-taken",
  /** 403: only the host can start the game or move to the next round. */
  "not-the-host",
  /** 409: moving to the next round while the game is still in the lobby. */
  "game-not-started",
  /** 409: starting with fewer than two players, or fewer than three in impostor mode. */
  "not-enough-players",
  /** 409: moving on from a round the game has not reached yet. */
  "wrong-round",
  /** 409: moving on while the current round is still being estimated. */
  "round-not-revealed",
  /** 409: no question left for round 1; the game stays in the lobby. */
  "deck-exhausted",
  /** 409: impostor mode, and the voting of the current round is not over yet. */
  "voting-not-over",
]);
export type GamesErrorCode = z.infer<typeof GamesErrorCode>;

/** A player as every service sees it: the token's `id` and the nickname they joined with. */
export const GamePlayer = z.object({
  id: z.string().min(1),
  nickname: z.string().min(1),
});
export type GamePlayer = z.infer<typeof GamePlayer>;

/** Players in the order they joined. The host is one of them. */
export const GamePlayers = z.array(GamePlayer);
export type GamePlayers = z.infer<typeof GamePlayers>;

export const GamePhase = z.enum(["lobby", "playing", "finished"]);
export type GamePhase = z.infer<typeof GamePhase>;

/** The settings the host chose when creating the game. They never change. */
export const GameSettings = z.object({
  /** Packs to draw questions from; empty means every pack. */
  packs: z.array(z.string().min(1)),
  roundSeconds: z.number().int().positive(),
  /** Number of rounds. */
  rounds: z.number().int().positive(),
  impostorMode: z.boolean(),
});
export type GameSettings = z.infer<typeof GameSettings>;

/**
 * POST /api/games
 * The host creates a game with its settings. 400 `invalid-request` on a bad body.
 */
export const CreateGameRequest = z.object({
  /** Packs to draw questions from. Omit it to play with every pack, like the catalog. */
  packs: z.array(z.string().min(1)).min(1).optional(),
  /** Seconds each round lasts. */
  roundSeconds: z.number().int().positive(),
  /** Number of rounds. */
  rounds: z.number().int().positive().default(5),
  impostorMode: z.boolean(),
});
export type CreateGameRequest = z.input<typeof CreateGameRequest>;
// The host picks packs from the catalog's list (screen 02), so an unknown pack
// only comes in a hand-made request: starting that game fails with a 500.

/** 201 */
export const CreateGameResponse = z.object({
  /** Four upper-case letters, never I or O. Codes are upper-cased before lookup. */
  code: z.string().min(1),
});
export type CreateGameResponse = z.infer<typeof CreateGameResponse>;

/**
 * POST /api/games/:code/players
 * The player in the token joins the game, with the token's name as nickname.
 * No request body. 204, also when that player is already in the game.
 * Errors: 404 `unknown-code`, 409 `game-already-started`, 409 `nickname-taken`.
 */

/**
 * GET /api/games/:code
 * Polled every second by every phone (and by the acceptance drivers, like a
 * phone). Everyone sees the same answer. Error: 404 `unknown-code`.
 */
export const GameView = z.object({
  code: z.string().min(1),
  hostId: z.string().min(1),
  phase: GamePhase,
  /**
   * The round the game is on: the `n` for rounds, scoring and impostor.
   * Null in the lobby; a finished game keeps the last round it played.
   */
  currentRound: z.number().int().positive().nullable(),
  /** Fixed once the game starts: nobody joins late and nobody leaves. */
  players: GamePlayers,
  settings: GameSettings,
});
export type GameView = z.infer<typeof GameView>;

/**
 * POST /api/games/:code/start
 * The host starts the game. Games asks rounds (`rounds POST /internal/:code/1`)
 * and only moves to `playing`, with `currentRound` 1, once round 1 exists.
 * It sends the settings' packs, and leaves `packs` out when they are empty.
 * No request body. 204.
 * Errors: 403 `not-the-host`, 404 `unknown-code`, 409 `game-already-started`,
 * 409 `not-enough-players` (fewer than two, or three in impostor mode; rounds
 * is not asked), 409 `deck-exhausted` (the game stays in the lobby), 500 if
 * rounds fails.
 */

/**
 * POST /api/games/:code/next
 * The host moves the game on from `round`, also after the last round.
 * If the game has already moved on from `round` (a higher current round, or
 * finished), it answers 204 and changes nothing: a double click or a retry
 * never skips a round.
 * Otherwise games first asks rounds (`rounds GET /internal/:code/:n`) and only
 * moves on once the round is revealed (`solution` not null). In impostor mode
 * it then asks impostor (`impostor GET /internal/:code/:n/verdict`) and only
 * moves on once the verdict is not null; every round of an impostor game has
 * an impostor, so a 404 there is a failure, not a pass. Then it asks rounds
 * for round n + 1 and raises `currentRound` once it exists. After the last
 * round, or when rounds answers 409 `deck-exhausted`, the game becomes `finished`.
 * 204.
 * Errors: 403 `not-the-host`, 404 `unknown-code`, 409 `game-not-started`,
 * 409 `wrong-round` (`round` is ahead of the current round),
 * 409 `round-not-revealed`, 409 `voting-not-over`, 500 if rounds or impostor
 * fail or impostor has no verdict for the round (404).
 */
export const NextRoundRequest = z.object({
  /** The round the host is moving on from: the `currentRound` their phone sees. */
  round: z.number().int().positive(),
});
export type NextRoundRequest = z.infer<typeof NextRoundRequest>;

/**
 * GET /internal/:code/players (service to service: scoring)
 * Every player in the game, whether they estimated or not, in the order they
 * joined, and whether the game is in impostor mode, so scoring only asks for
 * verdicts when there are any. Error: 404 `unknown-code`.
 */
export const ListPlayersResponse = z.object({
  players: GamePlayers,
  impostorMode: z.boolean(),
});
export type ListPlayersResponse = z.infer<typeof ListPlayersResponse>;
// Games are never deleted while the service runs, so the final scoreboard
// always finds the players.
