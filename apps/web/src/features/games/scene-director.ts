/**
 * The scene director: which screen a phone shows, and which action goes in the
 * bottom slot. A pure function over plain view data; it imports nothing from
 * services or other features.
 */

import type { GameView } from "@hmk/contracts/games";

export interface SceneInput {
  gamePhase: GameView["phase"];
  impostorMode: boolean;
  isHost: boolean;
  /** Null while the round of `currentRound` is not found yet. */
  roundPhase: "estimating" | "revealed" | null;
  /** Null in normal mode, or before the voting view has arrived. */
  votingStatus: "pending" | "open" | "over" | null;
  /** This player already tapped "Ver clasificación" for the current round. */
  scoreboardSeen: boolean;
}

export type SceneScreen =
  | "lobby"
  | "loading"
  | "round"
  | "reveal"
  | "voting"
  | "verdict"
  | "scoreboard"
  | "final-ranking";

export type SceneAction =
  | "start"
  | "open-voting"
  | "view-scoreboard"
  | "next-round";

export interface Scene {
  screen: SceneScreen;
  action: SceneAction | null;
}

const hostOnly = (
  input: SceneInput,
  action: SceneAction
): SceneAction | null => (input.isHost ? action : null);

export const chooseScene = (input: SceneInput): Scene => {
  if (input.gamePhase === "finished") {
    return { screen: "final-ranking", action: null };
  }
  if (input.gamePhase === "lobby") {
    return { screen: "lobby", action: hostOnly(input, "start") };
  }
  if (input.roundPhase === null) {
    return { screen: "loading", action: null };
  }
  if (input.roundPhase === "estimating") {
    return { screen: "round", action: null };
  }

  // Revealed.
  if (!input.impostorMode) {
    return input.scoreboardSeen
      ? { screen: "scoreboard", action: hostOnly(input, "next-round") }
      : { screen: "reveal", action: "view-scoreboard" };
  }
  if (input.votingStatus === null) {
    return { screen: "loading", action: null };
  }
  if (input.votingStatus === "pending") {
    return { screen: "reveal", action: hostOnly(input, "open-voting") };
  }
  if (input.votingStatus === "open") {
    return { screen: "voting", action: null };
  }
  return input.scoreboardSeen
    ? { screen: "scoreboard", action: hostOnly(input, "next-round") }
    : { screen: "verdict", action: "view-scoreboard" };
};
