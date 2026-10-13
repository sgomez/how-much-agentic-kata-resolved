import { describe, expect, it } from "vitest";

import {
  orderScoreboard,
  scoreRound,
  scoreVerdict,
} from "../src/domain/scoring-rules.ts";
import type { PlayerEstimate } from "../src/domain/scoring-rules.ts";

describe("Scoring rules", () => {
  describe(scoreRound, () => {
    it("awards 3 points to closest alone, 0 to everyone else", () => {
      const solution = 50;
      // distance: alice=5, bob=10, charlie=15
      const estimates: PlayerEstimate[] = [
        { playerId: "alice", value: 45 },
        { playerId: "bob", value: 40 },
        { playerId: "charlie", value: 65 },
      ];

      const scored = scoreRound(solution, estimates);

      expect(scored).toStrictEqual([
        { playerId: "alice", value: 45, distance: 5, points: 3 },
        { playerId: "bob", value: 40, distance: 10, points: 0 },
        { playerId: "charlie", value: 65, distance: 15, points: 0 },
      ]);
    });

    it("awards 3 points to two players tied for closest", () => {
      const solution = 50;
      // distance: alice=5, bob=5, charlie=15
      const estimates: PlayerEstimate[] = [
        { playerId: "alice", value: 45 },
        { playerId: "bob", value: 55 },
        { playerId: "charlie", value: 65 },
      ];

      const scored = scoreRound(solution, estimates);

      expect(scored).toStrictEqual([
        { playerId: "alice", value: 45, distance: 5, points: 3 },
        { playerId: "bob", value: 55, distance: 5, points: 3 },
        { playerId: "charlie", value: 65, distance: 15, points: 0 },
      ]);
    });

    it("awards 3 points to three players tied for closest", () => {
      const solution = 100;
      // distance: alice=10, bob=10, charlie=10, david=50
      const estimates: PlayerEstimate[] = [
        { playerId: "alice", value: 90 },
        { playerId: "bob", value: 110 },
        { playerId: "charlie", value: 90 },
        { playerId: "david", value: 50 },
      ];

      const scored = scoreRound(solution, estimates);

      expect(scored).toStrictEqual([
        { playerId: "alice", value: 90, distance: 10, points: 3 },
        { playerId: "bob", value: 110, distance: 10, points: 3 },
        { playerId: "charlie", value: 90, distance: 10, points: 3 },
        { playerId: "david", value: 50, distance: 50, points: 0 },
      ]);
    });

    it("awards 5 points (3 closest + 2 exact hit) to an exact hit", () => {
      const solution = 42;
      // distance: alice=0 (exact hit), bob=1
      const estimates: PlayerEstimate[] = [
        { playerId: "alice", value: 42 },
        { playerId: "bob", value: 41 },
      ];

      const scored = scoreRound(solution, estimates);

      expect(scored).toStrictEqual([
        { playerId: "alice", value: 42, distance: 0, points: 5 },
        { playerId: "bob", value: 41, distance: 1, points: 0 },
      ]);
    });

    it("awards 5 points to each exact hit tied with another exact hit", () => {
      const solution = 42;
      // distance: alice=0, bob=0, charlie=2
      const estimates: PlayerEstimate[] = [
        { playerId: "alice", value: 42 },
        { playerId: "bob", value: 42 },
        { playerId: "charlie", value: 40 },
      ];

      const scored = scoreRound(solution, estimates);

      expect(scored).toStrictEqual([
        { playerId: "alice", value: 42, distance: 0, points: 5 },
        { playerId: "bob", value: 42, distance: 0, points: 5 },
        { playerId: "charlie", value: 40, distance: 2, points: 0 },
      ]);
    });

    it("handles nobody answered (empty estimates array)", () => {
      const solution = 10;
      const estimates: PlayerEstimate[] = [];

      const scored = scoreRound(solution, estimates);

      expect(scored).toStrictEqual([]);
    });

    it("handles one single estimate (gets closest, or exact hit if matched)", () => {
      const solution = 10;
      const singleNotExact: PlayerEstimate[] = [
        { playerId: "alice", value: 12 },
      ];
      expect(scoreRound(solution, singleNotExact)).toStrictEqual([
        { playerId: "alice", value: 12, distance: 2, points: 3 },
      ]);

      const singleExact: PlayerEstimate[] = [{ playerId: "alice", value: 10 }];
      expect(scoreRound(solution, singleExact)).toStrictEqual([
        { playerId: "alice", value: 10, distance: 0, points: 5 },
      ]);
    });

    it("handles negative numbers and decimals with no rounding", () => {
      const solution = -10.5;
      // distance: alice=0.25, bob=0.25, charlie=5.5
      const estimates: PlayerEstimate[] = [
        { playerId: "alice", value: -10.25 },
        { playerId: "bob", value: -10.75 },
        { playerId: "charlie", value: -5 },
      ];

      const scored = scoreRound(solution, estimates);

      expect(scored).toStrictEqual([
        { playerId: "alice", value: -10.25, distance: 0.25, points: 3 },
        { playerId: "bob", value: -10.75, distance: 0.25, points: 3 },
        { playerId: "charlie", value: -5, distance: 5.5, points: 0 },
      ]);
    });
  });

  describe(scoreVerdict, () => {
    it("gives 5 points to the impostor and 0 to everyone else when verdict is escaped", () => {
      const gamePlayerIds = ["alice", "bob", "charlie", "impostor1"];
      const impostorId = "impostor1";

      const scores = scoreVerdict("escaped", impostorId, gamePlayerIds);

      expect(scores).toStrictEqual({
        alice: 0,
        bob: 0,
        charlie: 0,
        impostor1: 5,
      });
    });

    it("gives 0 to the impostor and 2 catching bonus to every other player of the game when caught", () => {
      const gamePlayerIds = ["alice", "bob", "charlie", "impostor1"];
      const impostorId = "impostor1";

      const scores = scoreVerdict("caught", impostorId, gamePlayerIds);

      expect(scores).toStrictEqual({
        alice: 2,
        bob: 2,
        charlie: 2,
        impostor1: 0,
      });
    });
  });

  describe(orderScoreboard, () => {
    it("sorts players by points descending", () => {
      const players = [
        { id: "p1", nickname: "Player 1" },
        { id: "p2", nickname: "Player 2" },
        { id: "p3", nickname: "Player 3" },
      ];
      const points = new Map([
        ["p1", 3],
        ["p2", 8],
        ["p3", 5],
      ]);

      const scoreboard = orderScoreboard(players, points);

      expect(scoreboard).toStrictEqual([
        { id: "p2", nickname: "Player 2", points: 8 },
        { id: "p3", nickname: "Player 3", points: 5 },
        { id: "p1", nickname: "Player 1", points: 3 },
      ]);
    });

    it("keeps joining order for players tied on points", () => {
      const players = [
        { id: "p1", nickname: "First" },
        { id: "p2", nickname: "Second" },
        { id: "p3", nickname: "Third" },
      ];
      const points = new Map([
        ["p1", 5],
        ["p2", 5],
        ["p3", 5],
      ]);

      const scoreboard = orderScoreboard(players, points);

      expect(scoreboard).toStrictEqual([
        { id: "p1", nickname: "First", points: 5 },
        { id: "p2", nickname: "Second", points: 5 },
        { id: "p3", nickname: "Third", points: 5 },
      ]);
    });

    it("displays 0 points for players without recorded points", () => {
      const players = [
        { id: "p1", nickname: "First" },
        { id: "p2", nickname: "Second" },
        { id: "p3", nickname: "Third" },
      ];
      const points = new Map([["p2", 3]]);

      const scoreboard = orderScoreboard(players, points);

      expect(scoreboard).toStrictEqual([
        { id: "p2", nickname: "Second", points: 3 },
        { id: "p1", nickname: "First", points: 0 },
        { id: "p3", nickname: "Third", points: 0 },
      ]);
    });
  });
});
