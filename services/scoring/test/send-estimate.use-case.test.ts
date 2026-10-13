import { describe, expect, it } from "vitest";

import { SendEstimate } from "../src/application/send-estimate.use-case.ts";
import type { EstimatesRepository } from "../src/domain/estimates.repository.ts";
import type {
  RoundDetails,
  RoundsPort,
} from "../src/domain/ports/rounds.port.ts";
import type { RoundEstimates } from "../src/domain/round-estimates.aggregate.ts";
import {
  NotAPlayer,
  OutOfRange,
  RoundNotFound,
  RoundRevealed,
} from "../src/domain/scoring.errors.ts";

class FakeEstimatesRepository implements EstimatesRepository {
  readonly #estimates = new Map<string, RoundEstimates>();

  get(code: string, round: number): Promise<RoundEstimates | undefined> {
    return Promise.resolve(this.#estimates.get(`${code}:${round}`));
  }

  save(estimates: RoundEstimates): Promise<void> {
    this.#estimates.set(`${estimates.code}:${estimates.round}`, estimates);
    return Promise.resolve();
  }
}

const createFakeRounds = (config: {
  round?: RoundDetails;
  error?: Error;
}): RoundsPort => ({
  getRound: (_code: string, round: number) => {
    if (config.error) {
      return Promise.reject(config.error);
    }
    if (!config.round) {
      return Promise.reject(new RoundNotFound(round));
    }
    return Promise.resolve(config.round);
  },
});

describe("SendEstimate use case", () => {
  it("stores the estimate and returns the stored value", async () => {
    const repository = new FakeEstimatesRepository();
    const rounds = createFakeRounds({
      round: {
        number: 1,
        deadline: "2026-10-13T10:00:00Z",
        min: 0,
        max: 100,
        solution: null,
      },
    });

    const useCase = new SendEstimate({ estimates: repository, rounds });
    const stored = await useCase.execute({
      code: "GAME",
      round: 1,
      playerId: "p1",
      value: 42,
    });

    expect(stored).toBe(42);

    const saved = await repository.get("GAME", 1);
    expect(saved?.getEstimate("p1")).toBe(42);
    expect(saved?.answeredPlayers()).toStrictEqual(["p1"]);
  });

  it("replaces an existing estimate for the player", async () => {
    const repository = new FakeEstimatesRepository();
    const rounds = createFakeRounds({
      round: {
        number: 1,
        deadline: "2026-10-13T10:00:00Z",
        min: 0,
        max: 100,
        solution: null,
      },
    });

    const useCase = new SendEstimate({ estimates: repository, rounds });
    await useCase.execute({
      code: "GAME",
      round: 1,
      playerId: "p1",
      value: 42,
    });
    const updated = await useCase.execute({
      code: "GAME",
      round: 1,
      playerId: "p1",
      value: 84,
    });

    expect(updated).toBe(84);
    const saved = await repository.get("GAME", 1);
    expect(saved?.getEstimate("p1")).toBe(84);
    expect(saved?.answeredPlayers()).toStrictEqual(["p1"]);
  });

  it("rejects when out of ruler range", async () => {
    const repository = new FakeEstimatesRepository();
    const rounds = createFakeRounds({
      round: {
        number: 1,
        deadline: "2026-10-13T10:00:00Z",
        min: 10,
        max: 50,
        solution: null,
      },
    });

    const useCase = new SendEstimate({ estimates: repository, rounds });

    await expect(
      useCase.execute({
        code: "GAME",
        round: 1,
        playerId: "p1",
        value: 5,
      })
    ).rejects.toThrow(OutOfRange);
  });

  it("rejects when round is already revealed", async () => {
    const repository = new FakeEstimatesRepository();
    const rounds = createFakeRounds({
      round: {
        number: 1,
        deadline: "2026-10-13T10:00:00Z",
        min: 0,
        max: 100,
        solution: 42,
      },
    });

    const useCase = new SendEstimate({ estimates: repository, rounds });

    await expect(
      useCase.execute({
        code: "GAME",
        round: 1,
        playerId: "p1",
        value: 42,
      })
    ).rejects.toThrow(RoundRevealed);
  });

  it("propagates RoundNotFound when rounds service reports round not found", async () => {
    const repository = new FakeEstimatesRepository();
    const rounds = createFakeRounds({
      error: new RoundNotFound(2),
    });

    const useCase = new SendEstimate({ estimates: repository, rounds });

    await expect(
      useCase.execute({
        code: "GAME",
        round: 2,
        playerId: "p1",
        value: 42,
      })
    ).rejects.toThrow(RoundNotFound);
  });

  it("propagates NotAPlayer when player is not in the round", async () => {
    const repository = new FakeEstimatesRepository();
    const rounds = createFakeRounds({
      error: new NotAPlayer(),
    });

    const useCase = new SendEstimate({ estimates: repository, rounds });

    await expect(
      useCase.execute({
        code: "GAME",
        round: 1,
        playerId: "p1",
        value: 42,
      })
    ).rejects.toThrow(NotAPlayer);
  });
});
