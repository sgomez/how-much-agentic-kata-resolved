import type { Question } from "@hmk/contracts/catalog";
import type { RoundPlayer } from "@hmk/contracts/rounds";
import { describe, expect, it } from "vitest";

import { GetRoundView } from "../src/application/get-round-view.query.ts";
import { Round } from "../src/domain/round.aggregate.ts";
import {
  NotAPlayerError,
  RoundNotFoundError,
} from "../src/domain/round.errors.ts";
import { FixedClock } from "../src/infra/fixed-clock.adapter.ts";
import { MemoryRoundRepository } from "../src/infra/memory-round-repository.adapter.ts";

const question: Question = {
  id: "q1",
  max: 100,
  min: 0,
  pack: "p1",
  solution: 42,
  text: "¿Cuánto?",
  unit: "u",
};

const players: RoundPlayer[] = [
  { id: "p1", nickname: "Player 1" },
  { id: "p2", nickname: "Player 2" },
];

describe("GetRoundView query", () => {
  const baseTime = new Date("2026-01-01T12:00:00.000Z");

  it("throws RoundNotFoundError when round does not exist", async () => {
    const rounds = new MemoryRoundRepository();
    const clock = new FixedClock(baseTime);
    const query = new GetRoundView({ clock, rounds });

    await expect(
      query.execute({ gameCode: "GAME", playerId: "p1", roundNumber: 1 })
    ).rejects.toThrow(RoundNotFoundError);
  });

  it("throws NotAPlayerError when requester is not a player of the round", async () => {
    const rounds = new MemoryRoundRepository();
    const clock = new FixedClock(baseTime);
    const round = Round.create({
      gameCode: "GAME",
      hostId: "p1",
      impostorMode: false,
      now: baseTime,
      number: 1,
      players,
      question,
      roundSeconds: 30,
    });
    await rounds.save(round);

    const query = new GetRoundView({ clock, rounds });

    await expect(
      query.execute({ gameCode: "GAME", playerId: "intruder", roundNumber: 1 })
    ).rejects.toThrow(NotAPlayerError);
  });

  it("returns estimating view before deadline with solution null", async () => {
    const rounds = new MemoryRoundRepository();
    const clock = new FixedClock(baseTime);
    const round = Round.create({
      gameCode: "GAME",
      hostId: "p1",
      impostorMode: false,
      now: baseTime,
      number: 1,
      players,
      question,
      roundSeconds: 30,
    });
    await rounds.save(round);

    const query = new GetRoundView({ clock, rounds });
    const view = await query.execute({
      gameCode: "GAME",
      playerId: "p1",
      roundNumber: 1,
    });

    expect(view).toStrictEqual({
      deadline: "2026-01-01T12:00:30.000Z",
      isImpostor: false,
      max: 100,
      min: 0,
      number: 1,
      phase: "estimating",
      question: "¿Cuánto?",
      roundSeconds: 30,
      serverNow: "2026-01-01T12:00:00.000Z",
      solution: null,
      unit: "u",
    });
  });

  it("returns revealed view at or after deadline with solution", async () => {
    const rounds = new MemoryRoundRepository();
    const clock = new FixedClock(new Date("2026-01-01T12:00:30.000Z"));
    const round = Round.create({
      gameCode: "GAME",
      hostId: "p1",
      impostorMode: false,
      now: baseTime,
      number: 1,
      players,
      question,
      roundSeconds: 30,
    });
    await rounds.save(round);

    const query = new GetRoundView({ clock, rounds });
    const view = await query.execute({
      gameCode: "GAME",
      playerId: "p1",
      roundNumber: 1,
    });

    expect(view.phase).toBe("revealed");
    expect(view.solution).toBe(42);
  });
});
