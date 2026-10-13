import { describe, expect, it } from "vitest";

import { ListEstimates } from "../src/application/list-estimates.query.ts";
import type { EstimatesRepository } from "../src/domain/estimates.repository.ts";
import { RoundEstimates } from "../src/domain/round-estimates.aggregate.ts";

class FakeEstimatesRepository implements EstimatesRepository {
  readonly #estimates = new Map<string, RoundEstimates>();

  set(estimates: RoundEstimates): void {
    this.#estimates.set(`${estimates.code}:${estimates.round}`, estimates);
  }

  get(code: string, round: number): Promise<RoundEstimates | undefined> {
    return Promise.resolve(this.#estimates.get(`${code}:${round}`));
  }

  save(estimates: RoundEstimates): Promise<void> {
    this.#estimates.set(`${estimates.code}:${estimates.round}`, estimates);
    return Promise.resolve();
  }
}

describe("ListEstimates query", () => {
  it("returns empty answered and null estimate for an unknown round without calling rounds", async () => {
    const repository = new FakeEstimatesRepository();
    const query = new ListEstimates({ estimates: repository });

    const result = await query.execute({
      code: "UNKNOWN",
      round: 1,
      playerId: "p1",
    });

    expect(result).toStrictEqual({
      answered: [],
      myEstimate: null,
    });
  });

  it("returns answered player ids and asking player estimate", async () => {
    const repository = new FakeEstimatesRepository();
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
    repository.set(estimates);

    const query = new ListEstimates({ estimates: repository });

    const p1Result = await query.execute({
      code: "GAME",
      round: 1,
      playerId: "p1",
    });
    expect(p1Result).toStrictEqual({
      answered: ["p1", "p2"],
      myEstimate: 10,
    });

    const p3Result = await query.execute({
      code: "GAME",
      round: 1,
      playerId: "p3",
    });
    expect(p3Result).toStrictEqual({
      answered: ["p1", "p2"],
      myEstimate: null,
    });
  });
});
