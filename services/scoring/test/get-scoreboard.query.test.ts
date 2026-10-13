import { describe, expect, it } from "vitest";

import { GetScoreboardQuery } from "../src/application/get-scoreboard.query.ts";
import { RoundEstimates } from "../src/domain/round-estimates.aggregate.ts";
import { MemoryEstimatesRepository } from "../src/infra/memory-estimates-repository.adapter.ts";
import { MemoryGamesAdapter } from "../src/infra/memory-games.adapter.ts";
import { MemoryImpostorAdapter } from "../src/infra/memory-impostor.adapter.ts";
import { MemoryRevealedRoundsAdapter } from "../src/infra/memory-revealed-rounds.adapter.ts";
import { MemoryRoundsAdapter } from "../src/infra/memory-rounds.adapter.ts";
import { MemoryVerdictsAdapter } from "../src/infra/memory-verdicts.adapter.ts";

const setup = () => {
  const games = new MemoryGamesAdapter();
  const rounds = new MemoryRoundsAdapter();
  const estimates = new MemoryEstimatesRepository();
  const revealedRounds = new MemoryRevealedRoundsAdapter();
  const impostor = new MemoryImpostorAdapter();
  const verdicts = new MemoryVerdictsAdapter();
  const query = new GetScoreboardQuery({
    estimates,
    games,
    impostor,
    revealedRounds,
    rounds,
    verdicts,
  });
  return {
    estimates,
    games,
    impostor,
    query,
    revealedRounds,
    rounds,
    verdicts,
  };
};

describe(GetScoreboardQuery, () => {
  it("returns all players with 0 points when no rounds exist", async () => {
    const { games, query } = setup();
    games.setGame("GAME", {
      impostorMode: false,
      players: [
        { id: "p1", nickname: "Ana" },
        { id: "p2", nickname: "Luis" },
      ],
    });

    const result = await query.execute("GAME", "p1");

    expect(result.players).toStrictEqual([
      { id: "p1", nickname: "Ana", points: 0 },
      { id: "p2", nickname: "Luis", points: 0 },
    ]);
  });

  it("accumulates points across revealed rounds and sorts highest first", async () => {
    const { games, rounds, estimates, query } = setup();
    games.setGame("GAME", {
      impostorMode: false,
      players: [
        { id: "p1", nickname: "Ana" },
        { id: "p2", nickname: "Luis" },
        { id: "p3", nickname: "Eva" },
      ],
    });

    rounds.setRound("GAME", {
      deadline: "2026-10-13T10:00:00.000Z",
      max: 200,
      min: 0,
      number: 1,
      solution: 100,
    });
    const re1 = RoundEstimates.start("GAME", 1);
    re1.record({
      playerId: "p1",
      value: 100,
      min: 0,
      max: 200,
      solution: null,
    });
    re1.record({ playerId: "p2", value: 90, min: 0, max: 200, solution: null });
    await estimates.save(re1);

    rounds.setRound("GAME", {
      deadline: "2026-10-13T10:05:00.000Z",
      max: 100,
      min: 0,
      number: 2,
      solution: 50,
    });
    const re2 = RoundEstimates.start("GAME", 2);
    re2.record({ playerId: "p1", value: 10, min: 0, max: 100, solution: null });
    re2.record({ playerId: "p2", value: 49, min: 0, max: 100, solution: null });
    re2.record({ playerId: "p3", value: 60, min: 0, max: 100, solution: null });
    await estimates.save(re2);

    const result = await query.execute("GAME", "p1");

    expect(result.players).toStrictEqual([
      { id: "p1", nickname: "Ana", points: 5 },
      { id: "p2", nickname: "Luis", points: 3 },
      { id: "p3", nickname: "Eva", points: 0 },
    ]);
  });

  it("keeps joining order for players tied on points", async () => {
    const { games, rounds, estimates, query } = setup();
    games.setGame("GAME", {
      impostorMode: false,
      players: [
        { id: "p1", nickname: "Ana" },
        { id: "p2", nickname: "Luis" },
        { id: "p3", nickname: "Eva" },
      ],
    });

    rounds.setRound("GAME", {
      deadline: "2026-10-13T10:00:00.000Z",
      max: 200,
      min: 0,
      number: 1,
      solution: 100,
    });
    const re = RoundEstimates.start("GAME", 1);
    re.record({ playerId: "p1", value: 90, min: 0, max: 200, solution: null });
    re.record({ playerId: "p2", value: 50, min: 0, max: 200, solution: null });
    re.record({ playerId: "p3", value: 110, min: 0, max: 200, solution: null });
    await estimates.save(re);

    const result = await query.execute("GAME", "p2");

    expect(result.players).toStrictEqual([
      { id: "p1", nickname: "Ana", points: 3 },
      { id: "p3", nickname: "Eva", points: 3 },
      { id: "p2", nickname: "Luis", points: 0 },
    ]);
  });

  it("ignores rounds that are still estimating (solution is null)", async () => {
    const { games, rounds, estimates, query } = setup();
    games.setGame("GAME", {
      impostorMode: false,
      players: [
        { id: "p1", nickname: "Ana" },
        { id: "p2", nickname: "Luis" },
      ],
    });

    rounds.setRound("GAME", {
      deadline: "2026-10-13T10:00:00.000Z",
      max: 200,
      min: 0,
      number: 1,
      solution: null,
    });
    const re = RoundEstimates.start("GAME", 1);
    re.record({ playerId: "p1", value: 100, min: 0, max: 200, solution: null });
    await estimates.save(re);

    const result = await query.execute("GAME", "p1");

    expect(result.players).toStrictEqual([
      { id: "p1", nickname: "Ana", points: 0 },
      { id: "p2", nickname: "Luis", points: 0 },
    ]);
  });

  it("caches revealed round solution and range", async () => {
    const { games, rounds, revealedRounds, query } = setup();
    games.setGame("GAME", {
      impostorMode: false,
      players: [{ id: "p1", nickname: "Ana" }],
    });

    rounds.setRound("GAME", {
      deadline: "2026-10-13T10:00:00.000Z",
      max: 50,
      min: 10,
      number: 1,
      solution: 30,
    });

    await query.execute("GAME", "p1");

    const cached = await revealedRounds.get("GAME", 1);
    expect(cached).toStrictEqual({
      max: 50,
      min: 10,
      number: 1,
      solution: 30,
    });
  });

  it("rejects non-players with NotAPlayer error", async () => {
    const { games, query } = setup();
    games.setGame("GAME", {
      impostorMode: false,
      players: [{ id: "p1", nickname: "Ana" }],
    });

    await expect(query.execute("GAME", "intruder")).rejects.toThrow(
      "Player is not part of this round"
    );
  });

  it("rejects unknown game with UnknownCode error", async () => {
    const { query } = setup();

    await expect(query.execute("UNKNOWN", "p1")).rejects.toThrow(
      "Game UNKNOWN not found"
    );
  });

  it("in impostor mode adds 5 points to escaped impostor and 0 to others", async () => {
    const { games, rounds, impostor, query } = setup();
    games.setGame("GAME", {
      impostorMode: true,
      players: [
        { id: "p1", nickname: "Ana" },
        { id: "p2", nickname: "Luis" },
        { id: "p3", nickname: "Eva" },
      ],
    });

    rounds.setRound("GAME", {
      deadline: "2026-10-13T10:00:00.000Z",
      max: 100,
      min: 0,
      number: 1,
      solution: 50,
    });

    impostor.setVerdict("GAME", 1, {
      impostorId: "p2",
      verdict: "escaped",
    });

    const result = await query.execute("GAME", "p1");

    expect(result.players).toStrictEqual([
      { id: "p2", nickname: "Luis", points: 5 },
      { id: "p1", nickname: "Ana", points: 0 },
      { id: "p3", nickname: "Eva", points: 0 },
    ]);
  });

  it("in impostor mode adds 2 catching bonus to other players and 0 to caught impostor", async () => {
    const { games, rounds, impostor, query } = setup();
    games.setGame("GAME", {
      impostorMode: true,
      players: [
        { id: "p1", nickname: "Ana" },
        { id: "p2", nickname: "Luis" },
        { id: "p3", nickname: "Eva" },
      ],
    });

    rounds.setRound("GAME", {
      deadline: "2026-10-13T10:00:00.000Z",
      max: 100,
      min: 0,
      number: 1,
      solution: 50,
    });

    impostor.setVerdict("GAME", 1, {
      impostorId: "p2",
      verdict: "caught",
    });

    const result = await query.execute("GAME", "p1");

    expect(result.players).toStrictEqual([
      { id: "p1", nickname: "Ana", points: 2 },
      { id: "p3", nickname: "Eva", points: 2 },
      { id: "p2", nickname: "Luis", points: 0 },
    ]);
  });

  it("in impostor mode adds nothing when verdict is null (pending/open)", async () => {
    const { games, rounds, impostor, query } = setup();
    games.setGame("GAME", {
      impostorMode: true,
      players: [
        { id: "p1", nickname: "Ana" },
        { id: "p2", nickname: "Luis" },
      ],
    });

    rounds.setRound("GAME", {
      deadline: "2026-10-13T10:00:00.000Z",
      max: 100,
      min: 0,
      number: 1,
      solution: 50,
    });

    impostor.setVerdict("GAME", 1, {
      impostorId: null,
      verdict: null,
    });

    const result = await query.execute("GAME", "p1");

    expect(result.players).toStrictEqual([
      { id: "p1", nickname: "Ana", points: 0 },
      { id: "p2", nickname: "Luis", points: 0 },
    ]);
  });

  it("in impostor mode fails if impostor port fails", async () => {
    const { games, rounds, impostor, query } = setup();
    games.setGame("GAME", {
      impostorMode: true,
      players: [{ id: "p1", nickname: "Ana" }],
    });

    rounds.setRound("GAME", {
      deadline: "2026-10-13T10:00:00.000Z",
      max: 100,
      min: 0,
      number: 1,
      solution: 50,
    });

    impostor.setError("GAME", 1, new Error("impostor unavailable"));

    await expect(query.execute("GAME", "p1")).rejects.toThrow(
      "impostor unavailable"
    );
  });
});
