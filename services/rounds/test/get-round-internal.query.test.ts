import type { Question } from "@hmk/contracts/catalog";
import type { RoundPlayer } from "@hmk/contracts/rounds";
import { describe, expect, it } from "vitest";

import { GetRoundInternal } from "../src/application/get-round-internal.query.ts";
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

describe("GetRoundInternal query", () => {
  const baseTime = new Date("2026-01-01T12:00:00.000Z");

  it("throws RoundNotFoundError when round does not exist", async () => {
    const rounds = new MemoryRoundRepository();
    const clock = new FixedClock(baseTime);
    const query = new GetRoundInternal({ clock, rounds });

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

    const query = new GetRoundInternal({ clock, rounds });

    await expect(
      query.execute({ gameCode: "GAME", playerId: "intruder", roundNumber: 1 })
    ).rejects.toThrow(NotAPlayerError);
  });

  it("returns internal read before deadline with solution null", async () => {
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

    const query = new GetRoundInternal({ clock, rounds });
    const result = await query.execute({
      gameCode: "GAME",
      playerId: "p1",
      roundNumber: 1,
    });

    expect(result).toStrictEqual({
      deadline: "2026-01-01T12:00:30.000Z",
      max: 100,
      min: 0,
      number: 1,
      solution: null,
    });
  });

  it("returns internal read at deadline with revealed solution", async () => {
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

    const query = new GetRoundInternal({ clock, rounds });
    const result = await query.execute({
      gameCode: "GAME",
      playerId: "p1",
      roundNumber: 1,
    });

    expect(result).toStrictEqual({
      deadline: "2026-01-01T12:00:30.000Z",
      max: 100,
      min: 0,
      number: 1,
      solution: 42,
    });
  });
});
