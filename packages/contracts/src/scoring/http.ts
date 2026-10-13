// HTTP contract of the scoring service.
//
// The phone reaches these routes through the gateway as `/api/scoring/...`;
// the gateway strips that prefix, so each comment shows the path the service
// sees. Every route needs the player's bearer token (`packages/auth`): the
// player is always the token's `id`, never a field in a body.
//
// Errors use the shared `ErrorBody` from `@hmk/contracts`. Domain errors map
// to a status through their kind (`packages/kit/src/errors.ts`).
import { z } from "zod";

/**
 * Error codes scoring answers with.
 *
 * - `unauthenticated` (401): no token or an invalid one (`packages/auth`).
 * - `invalid-request` (400): the body does not match the schema, e.g. `value` is not a number.
 * - `out-of-range` (422): the estimate is outside the round's ruler range, bounds included.
 * - `round-revealed` (409): the round's deadline has passed; no more estimates.
 * - `round-not-revealed` (409): the reveal was asked for before the deadline.
 * - `round-not-found` (404) and `not-a-player` (403): from rounds, passed through as they are.
 * - `unknown-code` (404): from games, passed through as it is.
 *
 * If a dependency (games, rounds, impostor) fails or does not answer, `@hmk/kit` answers 500 `internal`.
 */
export const ScoringErrorCode = z.enum([
  "unauthenticated",
  "invalid-request",
  "out-of-range",
  "round-revealed",
  "round-not-revealed",
  "round-not-found",
  "not-a-player",
  "unknown-code",
]);
export type ScoringErrorCode = z.infer<typeof ScoringErrorCode>;

/**
 * POST /:code/:n/estimates (phone: screen 04 Round)
 *
 * Sends or replaces the player's estimate for round `n`; the last one before
 * the deadline counts. `n` is `currentRound` from `GET /api/games/:code`.
 * Errors: 400 `invalid-request`, 422 `out-of-range`, 409 `round-revealed`,
 * 404 `round-not-found`, 403 `not-a-player`, 401 `unauthenticated`.
 */
export const SendEstimateRequest = z.object({
  /** Inside the round's [min, max], bounds included. Kept exactly as sent: no rounding. */
  value: z.number(),
});
export type SendEstimateRequest = z.infer<typeof SendEstimateRequest>;

export const SendEstimateResponse = z.object({
  /** The estimate now stored for this player and round. */
  value: z.number(),
});
export type SendEstimateResponse = z.infer<typeof SendEstimateResponse>;

/**
 * GET /:code/:n/estimates (phone: screens 04 Round and 05 After sending, AnswerTracker)
 *
 * Who has answered round `n`, and the asking player's own estimate. Never the
 * other players' values. A round with no estimates, or one that does not
 * exist, gives `answered: []` and `myEstimate: null`; it does not ask rounds.
 * Errors: 401 `unauthenticated`.
 */
export const ListEstimatesResponse = z.object({
  /** Player ids (token `id`) of those who have sent an estimate. */
  answered: z.array(z.string()),
  /** The asking player's estimate, or null if they have not sent one. */
  myEstimate: z.number().nullable(),
});
export type ListEstimatesResponse = z.infer<typeof ListEstimatesResponse>;

/**
 * GET /:code/:n/reveal (phone: screen 06 Reveal)
 *
 * Every estimate of round `n` with its distance and the points it earned,
 * once the deadline has passed.
 * Errors: 409 `round-not-revealed`, 404 `round-not-found`, 404 `unknown-code`,
 * 403 `not-a-player`, 401 `unauthenticated`.
 *
 * Not signed in any acta: it comes from the scoring group's sheet and was
 * confirmed by the group when writing this contract.
 * Open: should the solution stay hidden until the verdict in impostor rounds? (impostor decides)
 * Open: the impostor's 5 points are not here; they belong to the verdict, not to the round.
 */
export const RevealResponse = z.object({
  solution: z.number(),
  /** Players who sent an estimate, sorted by distance (closest first). */
  estimates: z.array(
    z.object({
      id: z.string(),
      nickname: z.string(),
      value: z.number(),
      /** Absolute difference between the estimate and the solution. */
      distance: z.number().nonnegative(),
      /** Points earned in this round: 3 for the closest, plus 2 for an exact hit. */
      points: z.number().int().nonnegative(),
    })
  ),
});
export type RevealResponse = z.infer<typeof RevealResponse>;

/**
 * GET /:code/scoreboard (phone: screens 09 Scoreboard and 10 Final ranking)
 *
 * Every player of the game with the points added up over its revealed rounds
 * and finished votings, computed on each read. Everyone sees the same list.
 * Only players of the game can view the scoreboard.
 * Errors: 404 `unknown-code`, 403 `not-a-player`, 401 `unauthenticated`.
 */
export const ScoreboardResponse = z.object({
  /** Sorted by points, highest first; ties keep the order in which players joined. */
  players: z.array(
    z.object({
      /** The player's id (token `id`). */
      id: z.string(),
      /** From games, read at request time. */
      nickname: z.string(),
      /** Game total. 0 when nothing has been revealed yet. */
      points: z.number().int().nonnegative(),
    })
  ),
});
export type ScoreboardResponse = z.infer<typeof ScoreboardResponse>;
