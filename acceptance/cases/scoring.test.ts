import { describe, expect, it } from "vitest";

import { newGame } from "../dsl/index.ts";

describe("scoring", () => {
  it("the closest estimate scores 3 points", async () => {
    const game = await newGame({
      players: ["ana", "luis", "eva"],
      solution: 270,
    });
    await game.estimate({ ana: 260, eva: 500, luis: 100 });

    await game.waitForReveal();

    const scoreboard = await game.scoreboard();
    expect(scoreboard).toStrictEqual({
      ana: 3,
      eva: 0,
      luis: 0,
    });
  });

  it("an exact estimate scores 3 plus 2 points", async () => {
    const game = await newGame({ players: ["ana", "luis"], solution: 270 });
    await game.estimate({ ana: 270, luis: 100 });

    await game.waitForReveal();

    const scoreboard = await game.scoreboard();
    expect(scoreboard).toStrictEqual({ ana: 5, luis: 0 });
  });

  it("players tied for closest score the same", async () => {
    const game = await newGame({
      players: ["ana", "luis", "eva"],
      solution: 270,
    });
    await game.estimate({ ana: 260, eva: 500, luis: 280 });

    await game.waitForReveal();

    const scoreboard = await game.scoreboard();
    expect(scoreboard).toStrictEqual({
      ana: 3,
      eva: 0,
      luis: 3,
    });
  });

  it("the scoreboard adds up points across rounds", async () => {
    const game = await newGame({ players: ["ana", "luis"], solution: 270 });
    await game.estimate({ ana: 270, luis: 100 });
    await game.waitForReveal();

    await game.nextRound({ solution: 50 });
    await game.estimate({ ana: 10, luis: 45 });
    await game.waitForReveal();

    const scoreboard = await game.scoreboard();
    expect(scoreboard).toStrictEqual({ ana: 5, luis: 3 });
  });
});
