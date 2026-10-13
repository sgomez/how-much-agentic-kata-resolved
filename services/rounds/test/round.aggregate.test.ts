import type { Question } from "@hmk/contracts/catalog";
import type { RoundPlayer } from "@hmk/contracts/rounds";
import { describe, expect, it } from "vitest";

import { Round } from "../src/domain/round.aggregate.ts";
import { NotAPlayerError } from "../src/domain/round.errors.ts";

const question: Question = {
  id: "q1",
  max: 100,
  min: 0,
  pack: "general",
  solution: 42,
  text: "¿Cuántos metros mide la torre?",
  unit: "metros",
};

const players: RoundPlayer[] = [
  { id: "p1", nickname: "Ana" },
  { id: "p2", nickname: "Beto" },
];

describe("Round aggregate", () => {
  const baseTime = new Date("2026-01-01T12:00:00.000Z");

  it("calculates deadline as now + roundSeconds", () => {
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

    expect(round.deadline).toStrictEqual(new Date("2026-01-01T12:00:30.000Z"));
    expect(round.isComplete()).toBeTruthy();
  });

  it("is in estimating phase before deadline and revealed at or after deadline", () => {
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

    expect(round.phase(baseTime)).toBe("estimating");
    expect(round.phase(new Date("2026-01-01T12:00:29.999Z"))).toBe(
      "estimating"
    );
    expect(round.phase(new Date("2026-01-01T12:00:30.000Z"))).toBe("revealed");
    expect(round.phase(new Date("2026-01-01T12:00:35.000Z"))).toBe("revealed");
  });

  it("returns player view during estimating phase with hidden solution", () => {
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

    const view = round.viewFor("p1", baseTime);

    expect(view).toStrictEqual({
      deadline: "2026-01-01T12:00:30.000Z",
      isImpostor: false,
      max: 100,
      min: 0,
      number: 1,
      phase: "estimating",
      question: "¿Cuántos metros mide la torre?",
      roundSeconds: 30,
      serverNow: "2026-01-01T12:00:00.000Z",
      solution: null,
      unit: "metros",
    });
  });

  it("returns player view during revealed phase with solution", () => {
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

    const afterDeadline = new Date("2026-01-01T12:00:31.000Z");
    const view = round.viewFor("p2", afterDeadline);

    expect(view).toMatchObject({
      isImpostor: false,
      phase: "revealed",
      solution: 42,
    });
  });

  it("rejects view request for a non-player", () => {
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

    expect(() => round.viewFor("intruder", baseTime)).toThrow(NotAPlayerError);
  });
});
