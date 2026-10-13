import { describe, expect, it } from "vitest";

import { CreateGame } from "../src/application/create-game.use-case.ts";
import { GetGameView } from "../src/application/get-game-view.query.ts";
import { JoinGame } from "../src/application/join-game.use-case.ts";
import type { Player, Settings } from "../src/domain/game.aggregate.ts";
import { UnknownCodeError } from "../src/domain/game.errors.ts";
import { FixedCodeGenerator } from "../src/infra/fixed-code-generator.adapter.ts";
import { MemoryGameRepository } from "../src/infra/memory-game-repository.adapter.ts";

const ana: Player = { id: "u1", nickname: "Ana" };
const ben: Player = { id: "u2", nickname: "Ben" };
const settings: Settings = {
  impostorMode: false,
  packs: [],
  roundSeconds: 30,
  rounds: 3,
};

const setup = (codes: readonly string[]) => {
  const games = new MemoryGameRepository();
  return {
    createGame: new CreateGame({ codes: new FixedCodeGenerator(codes), games }),
    gameView: new GetGameView({ games }),
    joinGame: new JoinGame({ games }),
  };
};

describe(CreateGame, () => {
  it("creates a lobby with the host as its only player", async () => {
    const { createGame, gameView } = setup(["KQZT"]);

    const code = await createGame.execute({ host: ana, settings });

    const view = await gameView.execute(code);
    expect(view).toMatchObject({
      currentRound: null,
      hostId: "u1",
      phase: "lobby",
      players: [ana],
    });
  });

  it("skips a code another game already has", async () => {
    const { createGame } = setup(["KQZT", "KQZT", "ABCD"]);
    await createGame.execute({ host: ana, settings });

    const code = await createGame.execute({ host: ben, settings });

    expect(code).toBe("ABCD");
  });
});

describe(JoinGame, () => {
  it("finds the game whatever the case of the code", async () => {
    const { createGame, gameView, joinGame } = setup(["KQZT"]);
    await createGame.execute({ host: ana, settings });

    await joinGame.execute({ code: "kqzt", player: ben });

    const view = await gameView.execute("KQZT");
    expect(view.players).toStrictEqual([ana, ben]);
  });

  it("fails with unknown-code when no game has the code", async () => {
    const { joinGame } = setup(["KQZT"]);

    await expect(
      joinGame.execute({ code: "ZZZZ", player: ben })
    ).rejects.toBeInstanceOf(UnknownCodeError);
  });
});
