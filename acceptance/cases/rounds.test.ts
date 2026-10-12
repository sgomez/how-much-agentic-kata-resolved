import { describe, expect, it } from "vitest";

import { newGame } from "../dsl/index.ts";

describe("rounds", () => {
  it("all players see the same question, unit and ruler range", async () => {
    const game = await newGame({
      players: ["ana", "luis", "eva"],
      solution: 270,
    });

    const views = await Promise.all(
      ["ana", "luis", "eva"].map((alias) => game.viewOf(alias))
    );

    const shown = views.map(({ question, unit, min, max }) => ({
      max,
      min,
      question,
      unit,
    }));
    expect(new Set(shown.map((view) => JSON.stringify(view))).size).toBe(1);
    expect(shown[0]?.question).not.toBeNull();
  });

  it("a player who comes back gets their current view, estimate included", async () => {
    const game = await newGame({ players: ["ana", "luis"], solution: 270 });
    await game.estimate({ ana: 300 });

    const view = await game.viewOf("ana");

    expect(view).toMatchObject({
      number: 1,
      phase: "estimating",
      myEstimate: 300,
    });
  });

  it("the round is revealed after the deadline, with the solution", async () => {
    const game = await newGame({ players: ["ana", "luis"], solution: 270 });
    await game.estimate({ ana: 300 });

    await game.waitForReveal();

    const luisView = await game.viewOf("luis");
    expect(luisView).toMatchObject({
      phase: "revealed",
      solution: 270,
    });
  });
});
