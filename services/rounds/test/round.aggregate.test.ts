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

  it("returns internal view during estimating phase with hidden solution", () => {
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

    const internalView = round.internalViewFor("p1", baseTime);

    expect(internalView).toStrictEqual({
      deadline: "2026-01-01T12:00:30.000Z",
      max: 100,
      min: 0,
      number: 1,
      solution: null,
    });
  });

  it("returns internal view during revealed phase with solution", () => {
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

    const atDeadline = new Date("2026-01-01T12:00:30.000Z");
    const internalView = round.internalViewFor("p2", atDeadline);

    expect(internalView).toStrictEqual({
      deadline: "2026-01-01T12:00:30.000Z",
      max: 100,
      min: 0,
      number: 1,
      solution: 42,
    });
  });

  it("rejects internal view request for a non-player", () => {
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

    expect(() => round.internalViewFor("intruder", baseTime)).toThrow(
      NotAPlayerError
    );
  });

  it("in impostor mode, round is reserved until completed with an impostor", () => {
    const reserved = Round.create({
      gameCode: "GAME",
      hostId: "p1",
      impostorMode: true,
      now: baseTime,
      number: 1,
      players,
      question,
      roundSeconds: 30,
    });

    expect(reserved.isComplete()).toBeFalsy();
    expect(reserved.impostorId).toBeNull();

    const completed = reserved.complete("p2");
    expect(completed.isComplete()).toBeTruthy();
    expect(completed.impostorId).toBe("p2");
  });

  it("hides question and sets isImpostor: true for the impostor", () => {
    const round = Round.create({
      gameCode: "GAME",
      hostId: "p1",
      impostorMode: true,
      now: baseTime,
      number: 1,
      players,
      question,
      roundSeconds: 30,
    }).complete("p2");

    const impostorView = round.viewFor("p2", baseTime);
    expect(impostorView.isImpostor).toBeTruthy();
    expect(impostorView.question).toBeNull();
    expect(impostorView.unit).toBe("metros");
    expect("impostorId" in impostorView).toBeFalsy();
  });

  it("shows question and sets isImpostor: false for innocent players", () => {
    const round = Round.create({
      gameCode: "GAME",
      hostId: "p1",
      impostorMode: true,
      now: baseTime,
      number: 1,
      players,
      question,
      roundSeconds: 30,
    }).complete("p2");

    const innocentView = round.viewFor("p1", baseTime);
    expect(innocentView.isImpostor).toBeFalsy();
    expect(innocentView.question).toBe("¿Cuántos metros mide la torre?");
    expect(innocentView.unit).toBe("metros");
    expect("impostorId" in innocentView).toBeFalsy();
  });
});
