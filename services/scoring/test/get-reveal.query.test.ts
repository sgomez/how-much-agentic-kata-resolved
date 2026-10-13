import { describe, expect, it } from "vitest";

import { GetRevealQuery } from "../src/application/get-reveal.query.ts";
import { RoundEstimates } from "../src/domain/round-estimates.aggregate.ts";
import { NotAPlayer, RoundNotRevealed } from "../src/domain/scoring.errors.ts";
import { MemoryEstimatesRepository } from "../src/infra/memory-estimates-repository.adapter.ts";
import { MemoryGamesAdapter } from "../src/infra/memory-games.adapter.ts";
import { MemoryRevealedRoundsAdapter } from "../src/infra/memory-revealed-rounds.adapter.ts";
import { MemoryRoundsAdapter } from "../src/infra/memory-rounds.adapter.ts";

const setup = () => {
  const games = new MemoryGamesAdapter();
  const rounds = new MemoryRoundsAdapter();
  const estimates = new MemoryEstimatesRepository();
  const revealedRounds = new MemoryRevealedRoundsAdapter();
  const query = new GetRevealQuery({
    estimates,
    games,
    revealedRounds,
    rounds,
  });
  return { estimates, games, query, revealedRounds, rounds };
};

describe(GetRevealQuery, () => {
  it("answers solution and estimates sorted closest first with points", async () => {
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
    re.record({ playerId: "p1", value: 120, min: 0, max: 200, solution: null });
    re.record({ playerId: "p2", value: 100, min: 0, max: 200, solution: null });
    re.record({ playerId: "p3", value: 50, min: 0, max: 200, solution: null });
    await estimates.save(re);

    const result = await query.execute({
      askingPlayerId: "p1",
      code: "GAME",
      round: 1,
    });

    expect(result.solution).toBe(100);
    expect(result.estimates).toStrictEqual([
      {
        distance: 0,
        id: "p2",
        nickname: "Luis",
        points: 5,
        value: 100,
      },
      {
        distance: 20,
        id: "p1",
        nickname: "Ana",
        points: 0,
        value: 120,
      },
      {
        distance: 50,
        id: "p3",
        nickname: "Eva",
        points: 0,
        value: 50,
      },
    ]);
  });

  it("throws RoundNotRevealed when solution is null", async () => {
    const { games, rounds, query } = setup();
    games.setGame("GAME", {
      impostorMode: false,
      players: [{ id: "p1", nickname: "Ana" }],
    });

    rounds.setRound("GAME", {
      deadline: "2026-10-13T10:00:00.000Z",
      max: 200,
      min: 0,
      number: 1,
      solution: null,
    });

    await expect(
      query.execute({ askingPlayerId: "p1", code: "GAME", round: 1 })
    ).rejects.toThrow(RoundNotRevealed);
  });

  it("throws NotAPlayer for non-players", async () => {
    const { games, rounds, query } = setup();
    games.setGame("GAME", {
      impostorMode: false,
      players: [{ id: "p1", nickname: "Ana" }],
    });

    rounds.setRound("GAME", {
      deadline: "2026-10-13T10:00:00.000Z",
      max: 200,
      min: 0,
      number: 1,
      solution: 100,
    });

    await expect(
      query.execute({ askingPlayerId: "intruder", code: "GAME", round: 1 })
    ).rejects.toThrow(NotAPlayer);
  });

  it("caches revealed round solution and range", async () => {
    const { games, rounds, revealedRounds, query } = setup();
    games.setGame("GAME", {
      impostorMode: false,
      players: [{ id: "p1", nickname: "Ana" }],
    });

    rounds.setRound("GAME", {
      deadline: "2026-10-13T10:00:00.000Z",
      max: 100,
      min: 10,
      number: 1,
      solution: 80,
    });

    await query.execute({ askingPlayerId: "p1", code: "GAME", round: 1 });

    const cached = await revealedRounds.get("GAME", 1);
    expect(cached).toStrictEqual({
      max: 100,
      min: 10,
      number: 1,
      solution: 80,
    });
  });
});
