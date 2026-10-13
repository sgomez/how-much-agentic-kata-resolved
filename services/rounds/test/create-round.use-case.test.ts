import type { Question } from "@hmk/contracts/catalog";
import type { RoundPlayer } from "@hmk/contracts/rounds";
import { describe, expect, it } from "vitest";

import { CreateRound } from "../src/application/create-round.use-case.ts";
import {
  DeckExhaustedError,
  WrongRoundNumberError,
} from "../src/domain/round.errors.ts";
import { FixedClock } from "../src/infra/fixed-clock.adapter.ts";
import { MemoryCatalog } from "../src/infra/memory-catalog.adapter.ts";
import { MemoryRoundRepository } from "../src/infra/memory-round-repository.adapter.ts";

const question1: Question = {
  id: "q1",
  max: 100,
  min: 0,
  pack: "p1",
  solution: 10,
  text: "Q1",
  unit: "u",
};

const question2: Question = {
  id: "q2",
  max: 200,
  min: 0,
  pack: "p1",
  solution: 20,
  text: "Q2",
  unit: "u",
};

const players: RoundPlayer[] = [
  { id: "h1", nickname: "Host" },
  { id: "p2", nickname: "Player 2" },
];

describe("CreateRound use case", () => {
  it("creates round 1 and computes deadline from clock.now() + roundSeconds", async () => {
    const rounds = new MemoryRoundRepository();
    const catalog = new MemoryCatalog([question1]);
    const clock = new FixedClock(new Date("2026-01-01T10:00:00.000Z"));
    const useCase = new CreateRound({ catalog, clock, rounds });

    const result = await useCase.execute({
      gameCode: "GAME",
      hostId: "h1",
      impostorMode: false,
      packs: ["p1"],
      players,
      roundNumber: 1,
      roundSeconds: 30,
    });

    expect(result).toStrictEqual({ alreadyExisted: false, number: 1 });
    const saved = await rounds.findByGameAndNumber("GAME", 1);
    expect(saved).not.toBeNull();
    expect(saved?.deadline).toStrictEqual(new Date("2026-01-01T10:00:30.000Z"));
    expect(catalog.draws).toStrictEqual([{ gameId: "GAME", packs: ["p1"] }]);
  });

  it("creates round n + 1 after round n", async () => {
    const rounds = new MemoryRoundRepository();
    const catalog = new MemoryCatalog([question1, question2]);
    const clock = new FixedClock(new Date("2026-01-01T10:00:00.000Z"));
    const useCase = new CreateRound({ catalog, clock, rounds });

    await useCase.execute({
      gameCode: "GAME",
      hostId: "h1",
      impostorMode: false,
      players,
      roundNumber: 1,
      roundSeconds: 30,
    });

    const result = await useCase.execute({
      gameCode: "GAME",
      hostId: "h1",
      impostorMode: false,
      players,
      roundNumber: 2,
      roundSeconds: 30,
    });

    expect(result).toStrictEqual({ alreadyExisted: false, number: 2 });
    const saved2 = await rounds.findByGameAndNumber("GAME", 2);
    expect(saved2).not.toBeNull();
  });

  it("rejects wrong round numbers with WrongRoundNumberError", async () => {
    const rounds = new MemoryRoundRepository();
    const catalog = new MemoryCatalog([question1]);
    const clock = new FixedClock(new Date("2026-01-01T10:00:00.000Z"));
    const useCase = new CreateRound({ catalog, clock, rounds });

    await expect(
      useCase.execute({
        gameCode: "GAME",
        hostId: "h1",
        impostorMode: false,
        players,
        roundNumber: 2,
        roundSeconds: 30,
      })
    ).rejects.toThrow(WrongRoundNumberError);
  });

  it("asking again for a complete round returns alreadyExisted: true without drawing a new question", async () => {
    const rounds = new MemoryRoundRepository();
    const catalog = new MemoryCatalog([question1]);
    const clock = new FixedClock(new Date("2026-01-01T10:00:00.000Z"));
    const useCase = new CreateRound({ catalog, clock, rounds });

    await useCase.execute({
      gameCode: "GAME",
      hostId: "h1",
      impostorMode: false,
      players,
      roundNumber: 1,
      roundSeconds: 30,
    });

    expect(catalog.draws).toHaveLength(1);

    const retryResult = await useCase.execute({
      gameCode: "GAME",
      hostId: "h1",
      impostorMode: false,
      players,
      roundNumber: 1,
      roundSeconds: 30,
    });

    expect(retryResult).toStrictEqual({ alreadyExisted: true, number: 1 });
    expect(catalog.draws).toHaveLength(1);
  });

  it("fails with DeckExhaustedError when deck is exhausted and stores nothing", async () => {
    const rounds = new MemoryRoundRepository();
    // Catalog with empty questions list
    const catalog = new MemoryCatalog([]);
    const clock = new FixedClock(new Date("2026-01-01T10:00:00.000Z"));
    const useCase = new CreateRound({ catalog, clock, rounds });

    await expect(
      useCase.execute({
        gameCode: "GAME",
        hostId: "h1",
        impostorMode: false,
        players,
        roundNumber: 1,
        roundSeconds: 30,
      })
    ).rejects.toThrow(DeckExhaustedError);

    await expect(rounds.findByGameAndNumber("GAME", 1)).resolves.toBeNull();
  });

  it("stores nothing if catalog fails with an unexpected error", async () => {
    const rounds = new MemoryRoundRepository();
    const failingCatalog = {
      drawQuestion: () => Promise.reject(new Error("Catalog service error")),
    };
    const clock = new FixedClock(new Date("2026-01-01T10:00:00.000Z"));
    const useCase = new CreateRound({ catalog: failingCatalog, clock, rounds });

    await expect(
      useCase.execute({
        gameCode: "GAME",
        hostId: "h1",
        impostorMode: false,
        players,
        roundNumber: 1,
        roundSeconds: 30,
      })
    ).rejects.toThrow("Catalog service error");

    await expect(rounds.findByGameAndNumber("GAME", 1)).resolves.toBeNull();
  });

  it("draws from every pack when packs is omitted", async () => {
    const rounds = new MemoryRoundRepository();
    const catalog = new MemoryCatalog([question1]);
    const clock = new FixedClock(new Date("2026-01-01T10:00:00.000Z"));
    const useCase = new CreateRound({ catalog, clock, rounds });

    await useCase.execute({
      gameCode: "GAME",
      hostId: "h1",
      impostorMode: false,
      players,
      roundNumber: 1,
      roundSeconds: 30,
    });

    expect(catalog.draws).toStrictEqual([{ gameId: "GAME", packs: undefined }]);
  });
});
