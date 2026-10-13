import { describe, expect, it } from "vitest";

import { newGame } from "../dsl/index.ts";

const PLAYERS: [string, ...string[]] = ["ana", "luis", "eva", "leo"];

describe("impostor", () => {
  it("the impostor sees the unit but never the question", async () => {
    const game = await newGame({
      impostor: true,
      players: PLAYERS,
      solution: 270,
    });

    const impostor = await game.whoIsTheImpostor();
    const innocent = PLAYERS.find((alias) => alias !== impostor) ?? "";

    const [impostorView, innocentView] = await Promise.all([
      game.viewOf(impostor),
      game.viewOf(innocent),
    ]);
    expect(impostorView.question).toBeNull();
    expect(impostorView.unit).toBe(innocentView.unit);
    expect(innocentView.question).not.toBeNull();
  });

  it("an impostor nobody votes for scores 5 points", async () => {
    const game = await newGame({
      impostor: true,
      players: PLAYERS,
      solution: 270,
    });
    const impostor = await game.whoIsTheImpostor();
    const scapegoat = PLAYERS.find((alias) => alias !== impostor) ?? "";
    // The impostor is the farthest from 270, so they get no estimate points.
    await game.estimate(
      Object.fromEntries(
        PLAYERS.map((alias) => [alias, alias === impostor ? 999 : 500])
      )
    );
    await game.waitForReveal();

    await game.vote(
      Object.fromEntries(
        PLAYERS.filter((alias) => alias !== impostor).map((alias) => [
          alias,
          alias === scapegoat ? impostor : scapegoat,
        ])
      )
    );
    await game.waitForVotingToEnd();

    const scoreboard = await game.scoreboard();
    expect(scoreboard[impostor]).toBe(5);
  });

  it("an impostor who is found gets nothing for the vote", async () => {
    const game = await newGame({
      impostor: true,
      players: PLAYERS,
      solution: 270,
    });
    const impostor = await game.whoIsTheImpostor();
    // The impostor guesses far off, so any points they had would come from the vote.
    await game.estimate(
      Object.fromEntries(
        PLAYERS.map((alias) => [alias, alias === impostor ? 999 : 270])
      )
    );
    await game.waitForReveal();

    await game.vote(
      Object.fromEntries(
        PLAYERS.filter((alias) => alias !== impostor).map((alias) => [
          alias,
          impostor,
        ])
      )
    );
    await game.waitForVotingToEnd();

    const scoreboard = await game.scoreboard();
    expect(scoreboard[impostor]).toBe(0);
  });
});
