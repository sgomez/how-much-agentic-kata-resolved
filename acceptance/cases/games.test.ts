import { describe, expect, it } from "vitest";

import { newGame, openLobby, tryToJoin } from "../dsl/index.ts";

describe("games", () => {
  it("the host creates a game and players join it with its code", async () => {
    const lobby = await openLobby(["ana", "luis", "eva"]);

    for (const index of [0, 1, 2]) {
      // oxlint-disable-next-line no-await-in-loop
      const seen = await lobby.lobbySeenBy(index);
      expect(seen).toStrictEqual(expect.arrayContaining(lobby.nicknames));
    }
  });

  it("a code that matches no game is rejected", async () => {
    const outcome = await tryToJoin("ana", "NO-SUCH-GAME");
    expect(outcome).toBe("unknown-code");
  });

  it("when the host starts the game, every player sees the first round", async () => {
    const game = await newGame({
      players: ["ana", "luis", "eva"],
      solution: 270,
    });

    const evasView = await game.viewOf("eva");
    expect(evasView).toMatchObject({
      number: 1,
      phase: "estimating",
    });
  });
});
