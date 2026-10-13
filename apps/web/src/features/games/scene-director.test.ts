import { describe, expect, it } from "vitest";

import { chooseScene } from "./scene-director.ts";
import type { SceneInput } from "./scene-director.ts";

const base: SceneInput = {
  gamePhase: "playing",
  impostorMode: false,
  isHost: true,
  roundPhase: "estimating",
  votingStatus: null,
  scoreboardSeen: false,
};

const cases: {
  name: string;
  input: Partial<SceneInput>;
  screen: string;
  action: string | null;
}[] = [
  {
    name: "lobby, host",
    input: { gamePhase: "lobby", roundPhase: null },
    screen: "lobby",
    action: "start",
  },
  {
    name: "lobby, guest",
    input: { gamePhase: "lobby", roundPhase: null, isHost: false },
    screen: "lobby",
    action: null,
  },
  {
    name: "round not found yet",
    input: { roundPhase: null },
    screen: "loading",
    action: null,
  },
  {
    name: "estimating",
    input: { roundPhase: "estimating" },
    screen: "round",
    action: null,
  },
  {
    name: "estimating, impostor mode",
    input: { roundPhase: "estimating", impostorMode: true },
    screen: "round",
    action: null,
  },
  {
    name: "revealed, normal mode, scoreboard not seen",
    input: { roundPhase: "revealed" },
    screen: "reveal",
    action: "view-scoreboard",
  },
  {
    name: "revealed, normal mode, guest",
    input: { roundPhase: "revealed", isHost: false },
    screen: "reveal",
    action: "view-scoreboard",
  },
  {
    name: "revealed, voting pending, host",
    input: {
      roundPhase: "revealed",
      impostorMode: true,
      votingStatus: "pending",
    },
    screen: "reveal",
    action: "open-voting",
  },
  {
    name: "revealed, voting pending, guest",
    input: {
      roundPhase: "revealed",
      impostorMode: true,
      votingStatus: "pending",
      isHost: false,
    },
    screen: "reveal",
    action: null,
  },
  {
    name: "revealed, voting open",
    input: { roundPhase: "revealed", impostorMode: true, votingStatus: "open" },
    screen: "voting",
    action: null,
  },
  {
    name: "revealed, voting over, scoreboard not seen",
    input: { roundPhase: "revealed", impostorMode: true, votingStatus: "over" },
    screen: "verdict",
    action: "view-scoreboard",
  },
  {
    name: "revealed, impostor mode, voting not loaded yet",
    input: { roundPhase: "revealed", impostorMode: true, votingStatus: null },
    screen: "loading",
    action: null,
  },
  {
    name: "revealed, normal mode, scoreboard seen, host",
    input: { roundPhase: "revealed", scoreboardSeen: true },
    screen: "scoreboard",
    action: "next-round",
  },
  {
    name: "revealed, normal mode, scoreboard seen, guest",
    input: { roundPhase: "revealed", scoreboardSeen: true, isHost: false },
    screen: "scoreboard",
    action: null,
  },
  {
    name: "revealed, voting over, scoreboard seen",
    input: {
      roundPhase: "revealed",
      impostorMode: true,
      votingStatus: "over",
      scoreboardSeen: true,
    },
    screen: "scoreboard",
    action: "next-round",
  },
  {
    name: "stale scoreboard flag never skips a voting still open",
    input: {
      roundPhase: "revealed",
      impostorMode: true,
      votingStatus: "open",
      scoreboardSeen: true,
    },
    screen: "voting",
    action: null,
  },
  {
    name: "finished",
    input: { gamePhase: "finished", roundPhase: "revealed" },
    screen: "final-ranking",
    action: null,
  },
];

describe(chooseScene, () => {
  it.each(cases)("$name", ({ input, screen, action }) => {
    expect(chooseScene({ ...base, ...input })).toStrictEqual({
      screen,
      action,
    });
  });
});
