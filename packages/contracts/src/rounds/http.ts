// HTTP contract of the rounds service.
//
// Signed at the contracts fair:
// - Games → Rounds: create round n (POST /internal/:code/:n).
// - Phone → Rounds: the round as one player sees it (GET /:code/:n).
// - Scoring → Rounds: the round, to check estimates and add up the scoreboard
//   (GET /internal/:code/:n).
//
// Every route requires a player's token, `/internal` ones included
// (`packages/auth`). A service calling another forwards the token of the
// player who started the request (`packages/kit/src/client.ts`): to create a
// round it is the host's. Without a token: 401 `unauthenticated`. A body that
// does not match its schema: 400 `invalid-request` (`@hmk/kit`).
//
// Open: ruler scale and step. The catalog's question has a ruler range but no
// scale or step, so today any number between min and max is valid (draft
// glossary, "Ruler scale and step"; needs a PR to the catalog).
import { z } from "zod";

/** A player of the game, as Games sends it when it creates a round. */
export const RoundPlayer = z.object({
  /** The player's id from the token (`packages/auth`), valid in every service. */
  id: z.string().min(1),
  nickname: z.string().min(1),
});
export type RoundPlayer = z.infer<typeof RoundPlayer>;

/**
 * POST /internal/:code/:n (service to service: Games, when the host presses
 * Start, n = 1, and when the game moves on, n = currentRound + 1).
 *
 * Rounds draws the question from the catalog and, in impostor mode, asks
 * Impostor to choose the impostor. It keeps a copy of `players` and `hostId`
 * for this round. It stores nothing if either call fails (5xx).
 *
 * Responses:
 * - 201 with `CreateRoundResponse` when the round is created.
 * - 200 with the same body when round n already exists (double click,
 *   retry): no new question is drawn.
 * - 409 `deck-exhausted`: no questions left in the packs (same code as the
 *   catalog). Games does not move currentRound.
 * - 409 `wrong-round-number`: n is not the next round of the game.
 * - 5xx: the catalog or Impostor failed; the round is not stored.
 *
 * Open: minimum number of players in impostor mode (Games). With fewer than
 * two candidates Impostor might reject the request.
 * Open: a player (or the host) who leaves mid-game leaves this copy of
 * `players` stale (draft glossary, "Host leaving"; Games).
 */
export const CreateRoundRequest = z
  .object({
    /** Every player of the game, host included, in order of joining. */
    players: z.array(RoundPlayer).min(1),
    hostId: z.string().min(1),
    /** Packs to draw the question from, passed as is to the catalog. */
    packs: z.array(z.string().min(1)).min(1),
    roundSeconds: z.number().int().positive(),
    impostorMode: z.boolean(),
  })
  .refine((body) => body.players.some((player) => player.id === body.hostId), {
    message: "hostId must be one of the players",
    path: ["hostId"],
  });
export type CreateRoundRequest = z.infer<typeof CreateRoundRequest>;

export const CreateRoundResponse = z.object({
  /** The n of the URL. */
  number: z.number().int().positive(),
});
export type CreateRoundResponse = z.infer<typeof CreateRoundResponse>;

export const CreateRoundErrorCode = z.enum([
  "deck-exhausted",
  "wrong-round-number",
]);
export type CreateRoundErrorCode = z.infer<typeof CreateRoundErrorCode>;

/** Phase of a round. Computed, never stored: revealed once now ≥ deadline. */
export const RoundPhase = z.enum(["estimating", "revealed"]);
export type RoundPhase = z.infer<typeof RoundPhase>;

/**
 * GET /:code/:n (from the phone through the gateway: /api/rounds/:code/:n).
 *
 * The round as the player in the token sees it. Phones poll it every second:
 * the scene director reads `phase`, screens 04 and 05 draw the question, the
 * ruler and the countdown, and the impostor host's screen reads `phase` to
 * know when the voting can open. n is `currentRound` from GET /api/games/:code.
 *
 * Errors:
 * - 403 `not-a-player`: the token's id is not among the round's players.
 * - 404 `round-not-found`: round n does not exist (yet). The phone shows
 *   "loading".
 *
 * `myEstimate` is not here: it belongs to Scoring
 * (GET /api/scoring/:code/:n/estimates) and the phone joins both.
 */
export const RoundViewResponse = z.object({
  number: z.number().int().positive(),
  phase: RoundPhase,
  /** Null for the impostor (impostor's view). */
  question: z.string().nullable(),
  /** Shown to everyone, the impostor included. */
  unit: z.string(),
  /** Ruler range, the same for every player. */
  min: z.number(),
  max: z.number(),
  /** ISO 8601, UTC. The `Countdown` component calls it `endsAt`: map it on the phone. */
  deadline: z.iso.datetime(),
  /** Server clock when answering, ISO 8601 UTC, so the phone can correct its own. */
  serverNow: z.iso.datetime(),
  /** Round length, the `Countdown` duration. */
  roundSeconds: z.number().int().positive(),
  /** Only tells whether the player asking is the impostor; never who is. */
  isImpostor: z.boolean(),
  /** Null until the round is revealed. */
  solution: z.number().nullable(),
});
export type RoundViewResponse = z.infer<typeof RoundViewResponse>;

/**
 * GET /internal/:code/:n (service to service: Scoring).
 *
 * The round, to check an estimate (deadline and ruler range, both bounds
 * included) and to add up the scoreboard (solution). The same fields for
 * every player, but the forwarded token must belong to a player of the round.
 * Scoring asks n = 1, 2, 3… until the 404, and keeps a copy of `solution`,
 * `min` and `max` once `solution` is not null, since they never change again.
 *
 * Errors:
 * - 403 `not-a-player`: the forwarded token's id is not among the round's
 *   players. Scoring passes it on to the phone.
 * - 404 `round-not-found`: round n does not exist. For the scoreboard: no more
 *   rounds.
 *
 * Open: this 403 reaches the scoreboard, which Games and Scoring signed as
 * not secret (no 403). Scoring decides.
 */
export const RoundInternalResponse = z.object({
  number: z.number().int().positive(),
  /** ISO 8601, UTC. The same deadline Rounds sends to Impostor. */
  deadline: z.iso.datetime(),
  min: z.number(),
  max: z.number(),
  /** Null until the deadline; not null means the round is revealed. */
  solution: z.number().nullable(),
});
export type RoundInternalResponse = z.infer<typeof RoundInternalResponse>;

/** Error codes of GET /:code/:n and GET /internal/:code/:n. */
export const RoundReadErrorCode = z.enum(["not-a-player", "round-not-found"]);
export type RoundReadErrorCode = z.infer<typeof RoundReadErrorCode>;
