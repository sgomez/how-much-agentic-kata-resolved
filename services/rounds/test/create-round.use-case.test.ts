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
import { MemoryImpostorAdapter } from "../src/infra/memory-impostor.adapter.ts";
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
  it("samples clock.now() before drawing question from catalog", async () => {
    const rounds = new MemoryRoundRepository();
    const order: string[] = [];
    const clock = {
      now: () => {
        order.push("clock");
        return new Date("2026-01-01T10:00:00.000Z");
      },
    };
    const catalog = {
      drawQuestion: () => {
        order.push("catalog");
        return Promise.resolve(question1);
      },
    };
    const impostor = new MemoryImpostorAdapter();
    const useCase = new CreateRound({ catalog, clock, impostor, rounds });

    await useCase.execute({
      gameCode: "GAME",
      hostId: "h1",
      impostorMode: false,
      players,
      roundNumber: 1,
      roundSeconds: 30,
    });

    expect(order).toStrictEqual(["clock", "catalog"]);
  });

  it("creates round 1 and computes deadline from clock.now() + roundSeconds", async () => {
    const rounds = new MemoryRoundRepository();
    const catalog = new MemoryCatalog([question1]);
    const clock = new FixedClock(new Date("2026-01-01T10:00:00.000Z"));
    const impostor = new MemoryImpostorAdapter();
    const useCase = new CreateRound({ catalog, clock, impostor, rounds });

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
    const impostor = new MemoryImpostorAdapter();
    const useCase = new CreateRound({ catalog, clock, impostor, rounds });

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
    const impostor = new MemoryImpostorAdapter();
    const useCase = new CreateRound({ catalog, clock, impostor, rounds });

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
    const impostor = new MemoryImpostorAdapter();
    const useCase = new CreateRound({ catalog, clock, impostor, rounds });

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
    const impostor = new MemoryImpostorAdapter();
    const useCase = new CreateRound({ catalog, clock, impostor, rounds });

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
    const impostor = new MemoryImpostorAdapter();
    const useCase = new CreateRound({
      catalog: failingCatalog,
      clock,
      impostor,
      rounds,
    });

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
    const impostor = new MemoryImpostorAdapter();
    const useCase = new CreateRound({ catalog, clock, impostor, rounds });

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

  it("in impostor mode, reserves round, asks Impostor, and completes round with impostorId", async () => {
    const rounds = new MemoryRoundRepository();
    const catalog = new MemoryCatalog([question1]);
    const impostor = new MemoryImpostorAdapter("p2");
    const clock = new FixedClock(new Date("2026-01-01T10:00:00.000Z"));
    const useCase = new CreateRound({ catalog, clock, impostor, rounds });

    const result = await useCase.execute({
      gameCode: "GAME",
      hostId: "h1",
      impostorMode: true,
      players,
      roundNumber: 1,
      roundSeconds: 30,
    });

    expect(result).toStrictEqual({ alreadyExisted: false, number: 1 });
    expect(impostor.calls[0]).toStrictEqual({
      candidates: players,
      deadline: new Date("2026-01-01T10:00:30.000Z"),
      gameCode: "GAME",
      hostId: "h1",
      roundNumber: 1,
    });

    const saved = await rounds.findByGameAndNumber("GAME", 1);
    expect(saved?.isComplete()).toBeTruthy();
    expect(saved?.impostorId).toBe("p2");
  });

  it("outside impostor mode, Impostor is never called", async () => {
    const rounds = new MemoryRoundRepository();
    const catalog = new MemoryCatalog([question1]);
    const impostor = new MemoryImpostorAdapter("p2");
    const clock = new FixedClock(new Date("2026-01-01T10:00:00.000Z"));
    const useCase = new CreateRound({ catalog, clock, impostor, rounds });

    await useCase.execute({
      gameCode: "GAME",
      hostId: "h1",
      impostorMode: false,
      players,
      roundNumber: 1,
      roundSeconds: 30,
    });

    expect(impostor.calls).toHaveLength(0);
  });

  it("when Impostor fails, reservation stays in repository as incomplete and error is thrown", async () => {
    const rounds = new MemoryRoundRepository();
    const catalog = new MemoryCatalog([question1]);
    const impostor = new MemoryImpostorAdapter("p2");
    impostor.setError(new Error("Impostor 500 error"));
    const clock = new FixedClock(new Date("2026-01-01T10:00:00.000Z"));
    const useCase = new CreateRound({ catalog, clock, impostor, rounds });

    await expect(
      useCase.execute({
        gameCode: "GAME",
        hostId: "h1",
        impostorMode: true,
        players,
        roundNumber: 1,
        roundSeconds: 30,
      })
    ).rejects.toThrow("Impostor 500 error");

    const saved = await rounds.findByGameAndNumber("GAME", 1);
    expect(saved?.isComplete()).toBeFalsy();
    expect(saved?.question).toStrictEqual(question1);
    expect(saved?.deadline).toStrictEqual(new Date("2026-01-01T10:00:30.000Z"));
  });

  it("on retry of a reserved round, reuses question and deadline, does not draw new question, asks Impostor again, and completes round answering alreadyExisted: false", async () => {
    const rounds = new MemoryRoundRepository();
    const catalog = new MemoryCatalog([question1, question2]);
    const impostor = new MemoryImpostorAdapter("p2");
    impostor.setError(new Error("Temporary Impostor failure"));
    const clock = new FixedClock(new Date("2026-01-01T10:00:00.000Z"));
    const useCase = new CreateRound({ catalog, clock, impostor, rounds });

    // First attempt fails at Impostor call
    await expect(
      useCase.execute({
        gameCode: "GAME",
        hostId: "h1",
        impostorMode: true,
        players,
        roundNumber: 1,
        roundSeconds: 30,
      })
    ).rejects.toThrow("Temporary Impostor failure");

    // Advance clock to simulate retry at a later time
    clock.set(new Date("2026-01-01T10:00:15.000Z"));
    impostor.setError(null);

    // Retry
    const retryResult = await useCase.execute({
      gameCode: "GAME",
      hostId: "h1",
      impostorMode: true,
      players,
      roundNumber: 1,
      roundSeconds: 30,
    });

    expect(retryResult).toStrictEqual({ alreadyExisted: false, number: 1 });
    // Catalog draw was NOT repeated!
    expect(catalog.draws).toHaveLength(1);
    // Impostor was called with the stored deadline, not a new one!
    expect(impostor.calls[1]?.deadline).toStrictEqual(
      new Date("2026-01-01T10:00:30.000Z")
    );

    const saved = await rounds.findByGameAndNumber("GAME", 1);
    expect(saved?.impostorId).toBe("p2");
  });
});
