import { describe, expect, it } from "vitest";

import { RoundEstimates } from "../src/domain/round-estimates.aggregate.ts";
import { OutOfRange, RoundRevealed } from "../src/domain/scoring.errors.ts";

describe("RoundEstimates aggregate", () => {
  it("records an estimate within [min, max] when solution is null", () => {
    const estimates = RoundEstimates.start("GAME", 1);

    const stored = estimates.record({
      playerId: "p1",
      value: 42,
      min: 0,
      max: 100,
      solution: null,
    });

    expect(stored).toBe(42);
    expect(estimates.getEstimate("p1")).toBe(42);
    expect(estimates.answeredPlayers()).toStrictEqual(["p1"]);
  });

  it("replaces an existing estimate for the same player", () => {
    const estimates = RoundEstimates.start("GAME", 1);

    estimates.record({
      playerId: "p1",
      value: 10,
      min: 0,
      max: 100,
      solution: null,
    });
    estimates.record({
      playerId: "p1",
      value: 20,
      min: 0,
      max: 100,
      solution: null,
    });

    expect(estimates.getEstimate("p1")).toBe(20);
    expect(estimates.answeredPlayers()).toStrictEqual(["p1"]);
  });

  it("accepts boundary values exactly at min and max", () => {
    const estimates = RoundEstimates.start("GAME", 1);

    estimates.record({
      playerId: "p1",
      value: 0,
      min: 0,
      max: 100,
      solution: null,
    });
    estimates.record({
      playerId: "p2",
      value: 100,
      min: 0,
      max: 100,
      solution: null,
    });

    expect(estimates.getEstimate("p1")).toBe(0);
    expect(estimates.getEstimate("p2")).toBe(100);
    expect(estimates.answeredPlayers()).toStrictEqual(["p1", "p2"]);
  });

  it("rejects an estimate below min", () => {
    const estimates = RoundEstimates.start("GAME", 1);

    expect(() =>
      estimates.record({
        playerId: "p1",
        value: -1,
        min: 0,
        max: 100,
        solution: null,
      })
    ).toThrow(OutOfRange);
  });

  it("rejects an estimate above max", () => {
    const estimates = RoundEstimates.start("GAME", 1);

    expect(() =>
      estimates.record({
        playerId: "p1",
        value: 101,
        min: 0,
        max: 100,
        solution: null,
      })
    ).toThrow(OutOfRange);
  });

  it("rejects an estimate when round is revealed (solution is not null)", () => {
    const estimates = RoundEstimates.start("GAME", 1);

    expect(() =>
      estimates.record({
        playerId: "p1",
        value: 50,
        min: 0,
        max: 100,
        solution: 50,
      })
    ).toThrow(RoundRevealed);
  });

  it("returns null for a player who has not answered", () => {
    const estimates = RoundEstimates.start("GAME", 1);

    expect(estimates.getEstimate("unknown")).toBeNull();
  });

  it("returns all estimates as PlayerEstimate array", () => {
    const estimates = RoundEstimates.start("GAME", 1);

    estimates.record({
      playerId: "p1",
      value: 10,
      min: 0,
      max: 100,
      solution: null,
    });
    estimates.record({
      playerId: "p2",
      value: 20,
      min: 0,
      max: 100,
      solution: null,
    });

    expect(estimates.allEstimates()).toStrictEqual([
      { playerId: "p1", value: 10 },
      { playerId: "p2", value: 20 },
    ]);
  });
});
