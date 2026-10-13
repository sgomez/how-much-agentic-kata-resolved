import type { Question } from "@hmk/contracts/catalog";
import { describe, expect, it } from "vitest";

import { Round } from "../src/domain/round.aggregate.ts";
import { MemoryRoundRepository } from "../src/infra/memory-round-repository.adapter.ts";

const question: Question = {
  id: "q1",
  max: 100,
  min: 0,
  pack: "general",
  solution: 42,
  text: "Q",
  unit: "u",
};

describe(MemoryRoundRepository, () => {
  it("saves and retrieves a round by game code and number", async () => {
    const repo = new MemoryRoundRepository();
    const round = Round.create({
      gameCode: "GAME",
      hostId: "h1",
      impostorMode: false,
      now: new Date(),
      number: 1,
      players: [{ id: "h1", nickname: "Host" }],
      question,
      roundSeconds: 30,
    });

    await repo.save(round);

    const found = await repo.findByGameAndNumber("GAME", 1);
    expect(found).toBe(round);

    const notFound = await repo.findByGameAndNumber("GAME", 2);
    expect(notFound).toBeNull();
  });

  it("finds the last round for a game", async () => {
    const repo = new MemoryRoundRepository();
    await expect(repo.findLastByGame("GAME")).resolves.toBeNull();

    const round1 = Round.create({
      gameCode: "GAME",
      hostId: "h1",
      impostorMode: false,
      now: new Date(),
      number: 1,
      players: [{ id: "h1", nickname: "Host" }],
      question,
      roundSeconds: 30,
    });
    await repo.save(round1);
    await expect(repo.findLastByGame("GAME")).resolves.toBe(round1);

    const round2 = Round.create({
      gameCode: "GAME",
      hostId: "h1",
      impostorMode: false,
      now: new Date(),
      number: 2,
      players: [{ id: "h1", nickname: "Host" }],
      question,
      roundSeconds: 30,
    });
    await repo.save(round2);
    await expect(repo.findLastByGame("GAME")).resolves.toBe(round2);
  });
});
