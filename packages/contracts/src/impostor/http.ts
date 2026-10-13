import { z } from "zod";

// HTTP contract of the impostor service.
//
// Paths are written as the impostor service sees them: phones reach the public
// ones through the gateway as `/api/impostor/...`; services call the
// `/internal` ones directly. Every route needs the player's token, internal
// ones included: the calling service forwards the token of the player who
// started the request. The player is always the `id` from that token
// (`packages/auth`), never a field in a body.

/** A player who can be voted for in a round: a copy of what Rounds sends when it creates the round. */
export const Candidate = z.object({
  /** User id from the token (`packages/auth`), the same in every service. */
  id: z.string().min(1),
  /** Unique per game ignoring case and leading/trailing spaces (Games glossary). */
  nickname: z.string().min(1),
});
export type Candidate = z.infer<typeof Candidate>;

/** The outcome of a round's voting. A tie or nobody voting is `escaped`; there is no third value. */
export const Verdict = z.enum(["caught", "escaped"]);
export type Verdict = z.infer<typeof Verdict>;

/**
 * Where a round's voting is: `pending` until the host opens it, `open` while
 * players vote, `over` once every candidate has voted or the host closed it.
 */
export const VotingStatus = z.enum(["pending", "open", "over"]);
export type VotingStatus = z.infer<typeof VotingStatus>;

/**
 * POST /internal/:code/:n/impostor (called by rounds when it creates round n
 * of a game in impostor mode, before it stores the round).
 * 201 with a new impostor; 200 with the same `impostorId` if this round
 * already has one. A repeated call changes nothing, not even the deadline:
 * the first one stays.
 */
export const ChooseImpostorRequest = z.object({
  /** Every player of the round, host included. */
  candidates: z
    .array(Candidate)
    .min(2)
    .refine(
      (candidates) =>
        new Set(candidates.map((c) => c.id)).size === candidates.length,
      { message: "candidate ids must be unique" }
    ),
  /** Only the host opens and closes the voting. */
  hostId: z.string().min(1),
  /** The round's deadline, the same one Rounds stores. The voting cannot open before it. */
  deadline: z.iso.datetime(),
});
export type ChooseImpostorRequest = z.infer<typeof ChooseImpostorRequest>;

export const ChooseImpostorResponse = z.object({
  /** One of `candidates[].id`. */
  impostorId: z.string().min(1),
});
export type ChooseImpostorResponse = z.infer<typeof ChooseImpostorResponse>;

/** Both fields are null until the voting is over, and both are set once it is. */
const verdictAndImpostorTogether = (body: {
  verdict: Verdict | null;
  impostorId: string | null;
}) => (body.verdict === null) === (body.impostorId === null);

/**
 * GET /internal/:code/:n/verdict (called by scoring for the scoreboard, and
 * by games before moving on to the next round in impostor mode).
 * 404 `round-not-found` when this service has no impostor for that round.
 * This service cannot tell a round without impostor from one it lost (it keeps
 * everything in memory and nobody tells it which games are in impostor mode):
 * a caller that knows the game is in impostor mode must treat 404 as a failure,
 * not as "no impostor".
 */
export const VerdictResponse = z
  .object({
    /** Null while the voting is not over. */
    verdict: Verdict.nullable(),
    /** Null while the voting is not over; it never changes afterwards. */
    impostorId: z.string().min(1).nullable(),
  })
  .refine(verdictAndImpostorTogether, {
    message: "verdict and impostorId are both null or both set",
    path: ["impostorId"],
  });
export type VerdictResponse = z.infer<typeof VerdictResponse>;

/**
 * GET /:code/:n (phones every second in impostor mode, from the reveal on:
 * the games scene director picks screen 07 or 08, and screens 07 Voting and
 * 08 Verdict draw it). Everyone in the round sees the same view.
 */
export const VotingView = z
  .object({
    voting: VotingStatus,
    /** Who can be voted for: the copy Rounds sent. */
    candidates: z.array(Candidate),
    /**
     * Ids of the players who have already voted. Never who they voted for. The
     * impostor never votes, so screens must not list who is missing.
     */
    voters: z.array(z.string().min(1)),
    /** Null until `voting` is `over`. */
    verdict: Verdict.nullable(),
    /** Null until `voting` is `over`. */
    impostorId: z.string().min(1).nullable(),
  })
  .refine(verdictAndImpostorTogether, {
    message: "verdict and impostorId are both null or both set",
    path: ["impostorId"],
  })
  .refine((view) => (view.voting === "over") === (view.verdict !== null), {
    message: "the verdict is set exactly when the voting is over",
    path: ["verdict"],
  });
export type VotingView = z.infer<typeof VotingView>;

// POST /:code/:n/voting (the host's phone opens the voting after the reveal)
// No body in the request, 204 with no body in the response: phones read the
// result in `VotingView`. Opening it again while it is open changes nothing.

/**
 * POST /:code/:n/votes (each player's phone). The voter comes from the token.
 * One vote per player, final, never for yourself. The impostor of the round
 * does not vote: their vote is refused with 403 `impostor-cannot-vote`. The
 * vote of the last candidate but the impostor ends the voting. 204 with no body in the response.
 */
export const CastVoteRequest = z.object({
  /** Matched against `candidates[].nickname` ignoring case and leading/trailing spaces. */
  suspectNickname: z.string().min(1),
});
export type CastVoteRequest = z.infer<typeof CastVoteRequest>;

// POST /:code/:n/voting/close (the host's phone ends the voting even if
// someone has not voted). No body in the request, 204 with no body in the
// response. Closing a voting that is already over changes nothing.

/**
 * Codes in `ErrorBody.error.code` returned by this service. The status comes
 * from the error kind in `@hmk/kit` (403 forbidden, 404 not found,
 * 409 conflict, 422 invalid).
 */
export const ImpostorErrorCode = z.enum([
  /** 404: no impostor for that round (unknown round, or a game without impostor mode). */
  "round-not-found",
  /** 403: the token's id is not among the round's candidates. */
  "not-a-player",
  /** 403: only the host opens or closes the voting. */
  "not-the-host",
  /** 409: opening the voting before the round's deadline. */
  "round-not-revealed",
  /** 409: opening a voting that is already over. */
  "voting-over",
  /** 409: voting, or closing, while the voting is not open. */
  "voting-not-open",
  /** 409: this player has already voted. */
  "already-voted",
  /** 422: a player voting for themselves. */
  "self-vote",
  /** 422: no candidate has that nickname. */
  "unknown-suspect",
]);
export type ImpostorErrorCode = z.infer<typeof ImpostorErrorCode>;
