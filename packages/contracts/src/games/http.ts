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
  /** 409: moving to the next round of a finished game. */
  "game-finished",
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
// Open: what happens with a pack the catalog does not have (rejected here, or
// a 422 `no-questions-in-packs` when the host starts)?
// Open: the code format (packages/ui/docs/open-decisions.md).

/** 201 */
export const CreateGameResponse = z.object({
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
  /** The round the game is on: the `n` for rounds, scoring and impostor. Null in the lobby. */
  currentRound: z.number().int().positive().nullable(),
  players: GamePlayers,
});
export type GameView = z.infer<typeof GameView>;
// Open: whether the view carries the settings (number of rounds, impostor mode).
// Open: whether a player who leaves mid-game stays in `players`.

/**
 * POST /api/games/:code/start
 * The host starts the game. Games asks rounds (`rounds POST /internal/:code/1`)
 * and only moves to `playing`, with `currentRound` 1, once round 1 exists.
 * No request body. 204.
 * Errors: 403 `not-the-host`, 404 `unknown-code`, 409 `game-already-started`,
 * 409 `deck-exhausted` (the game stays in the lobby), 502 if rounds does not answer.
 */
// Open: minimum number of players, in impostor mode or always (proposal: 3 in impostor mode).

/**
 * POST /api/games/:code/next
 * The host moves the game on, also after the last round. In impostor mode,
 * games first asks impostor (`impostor GET /internal/:code/:n/verdict`) and
 * only moves on once the voting of the current round is over; a 404 there
 * means the round has no impostor. Then it asks rounds for round n + 1 and
 * raises `currentRound` once it exists. After the last round, or when rounds
 * answers 409 `deck-exhausted`, the game becomes `finished`.
 * No request body. 204.
 * Errors: 403 `not-the-host`, 404 `unknown-code`, 409 `game-not-started`,
 * 409 `game-finished`, 409 `voting-not-over`, 502 if rounds or impostor do not answer.
 */

/**
 * GET /internal/:code/players (service to service: scoring)
 * Every player in the game, whether they estimated or not, in the order they
 * joined. Error: 404 `unknown-code`.
 */
export const ListPlayersResponse = z.object({
  players: GamePlayers,
});
export type ListPlayersResponse = z.infer<typeof ListPlayersResponse>;
// Open: how long a finished game exists. If it is deleted, the final
// scoreboard gets a 404 from here.
