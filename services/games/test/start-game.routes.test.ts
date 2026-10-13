import { createStaticVerifier } from "@hmk/auth";
import { GameView } from "@hmk/contracts/games";
import { describe, expect, it } from "vitest";

import { composeGames } from "../src/composition.ts";
import { Game } from "../src/domain/game.aggregate.ts";
import type { Player, Settings } from "../src/domain/game.aggregate.ts";
import { DeckExhaustedError } from "../src/domain/game.errors.ts";
import type { RoundsPort } from "../src/domain/ports/rounds.port.ts";
import { FixedCodeGenerator } from "../src/infra/fixed-code-generator.adapter.ts";
import { MemoryGameRepository } from "../src/infra/memory-game-repository.adapter.ts";
import { MemoryImpostor } from "../src/infra/memory-impostor.adapter.ts";
import { MemoryRounds } from "../src/infra/memory-rounds.adapter.ts";

const verifier = createStaticVerifier({
  "ana-token": { id: "u1", name: "Ana" },
  "luis-token": { id: "u2", name: "Luis" },
});
const ana: Player = { id: "u1", nickname: "Ana" };
const luis: Player = { id: "u2", nickname: "Luis" };
const eva: Player = { id: "u3", nickname: "Eva" };

const settings: Settings = {
  impostorMode: false,
  packs: [],
  roundSeconds: 30,
  rounds: 5,
};

const asAna = { headers: { authorization: "Bearer ana-token" } };
const startAs = (token: string) => ({
  headers: { authorization: `Bearer ${token}` },
  method: "POST",
});

/** A lobby whose players are put straight into the repository. */
const setup = async ({
  players = [ana, luis],
  rounds = new MemoryRounds(),
  settings: chosen = settings,
}: {
  players?: readonly Player[];
  rounds?: RoundsPort;
  settings?: Settings;
} = {}) => {
  const repository = new MemoryGameRepository();
  const [host = ana] = players;
  await repository.save(
    Game.restore({
      code: "KQZT",
      currentRound: null,
      host,
      phase: "lobby",
      players,
      settings: chosen,
    })
  );
  const app = composeGames({
    codes: new FixedCodeGenerator(["KQZT"]),
    games: repository,
    impostor: new MemoryImpostor(),
    rounds,
    verifier,
  });
  const view = async () => {
    const res = await app.request("/KQZT", asAna);
    return GameView.parse(await res.json());
  };
  return { app, view };
};

describe("start game", () => {
  it("moves to playing with round 1 once rounds has created it", async () => {
    const rounds = new MemoryRounds();
    const { app, view } = await setup({ players: [ana, luis, eva], rounds });

    const res = await app.request("/KQZT/start", startAs("ana-token"));

    expect(res.status).toBe(204);
    await expect(view()).resolves.toMatchObject({
      currentRound: 1,
      phase: "playing",
    });
    expect(rounds.created).toStrictEqual([
      {
        code: "KQZT",
        number: 1,
        request: {
          hostId: "u1",
          impostorMode: false,
          players: [
            { id: "u1", nickname: "Ana" },
            { id: "u2", nickname: "Luis" },
            { id: "u3", nickname: "Eva" },
          ],
          roundSeconds: 30,
        },
      },
    ]);
  });

  it("is still in the lobby while rounds creates round 1", async () => {
    let phaseSeenByRounds: string | undefined;
    const holder: { view?: () => Promise<GameView> } = {};
    const rounds: RoundsPort = {
      getRound: () => Promise.reject(new Error("not used")),
      createRound: async () => {
        const seen = await holder.view?.();
        phaseSeenByRounds = seen?.phase;
      },
    };
    const { app, view } = await setup({ rounds });
    holder.view = view;

    await app.request("/KQZT/start", startAs("ana-token"));

    expect(phaseSeenByRounds).toBe("lobby");
  });

  it("sends the packs to rounds only when the host picked some", async () => {
    const rounds = new MemoryRounds();
    const { app } = await setup({
      rounds,
      settings: { ...settings, packs: ["science"] },
    });

    await app.request("/KQZT/start", startAs("ana-token"));

    expect(rounds.created[0]?.request.packs).toStrictEqual(["science"]);
  });

  it("answers 409 deck-exhausted and stays in the lobby when no question is left", async () => {
    const rounds = new MemoryRounds();
    rounds.failWith(new DeckExhaustedError());
    const { app, view } = await setup({ rounds });

    const res = await app.request("/KQZT/start", startAs("ana-token"));

    expect(res.status).toBe(409);
    await expect(res.json()).resolves.toMatchObject({
      error: { code: "deck-exhausted" },
    });
    await expect(view()).resolves.toMatchObject({
      currentRound: null,
      phase: "lobby",
    });
  });

  it("answers 500 and stays in the lobby when rounds fails", async () => {
    const rounds = new MemoryRounds();
    rounds.failWith(new Error("rounds is down"));
    const { app, view } = await setup({ rounds });

    const res = await app.request("/KQZT/start", startAs("ana-token"));

    expect(res.status).toBe(500);
    await expect(view()).resolves.toMatchObject({
      currentRound: null,
      phase: "lobby",
    });
  });

  it("answers 403 not-the-host to another player, and asks rounds nothing", async () => {
    const rounds = new MemoryRounds();
    const { app, view } = await setup({ rounds });

    const res = await app.request("/KQZT/start", startAs("luis-token"));

    expect(res.status).toBe(403);
    await expect(res.json()).resolves.toMatchObject({
      error: { code: "not-the-host" },
    });
    expect(rounds.created).toHaveLength(0);
    await expect(view()).resolves.toMatchObject({ phase: "lobby" });
  });

  it.each([
    { name: "one player", players: [ana], impostorMode: false },
    {
      name: "two players in impostor mode",
      players: [ana, luis],
      impostorMode: true,
    },
  ])(
    "answers 409 not-enough-players with $name, and asks rounds nothing",
    async ({ players, impostorMode }) => {
      const rounds = new MemoryRounds();
      const { app, view } = await setup({
        players,
        rounds,
        settings: { ...settings, impostorMode },
      });

      const res = await app.request("/KQZT/start", startAs("ana-token"));

      expect(res.status).toBe(409);
      await expect(res.json()).resolves.toMatchObject({
        error: { code: "not-enough-players" },
      });
      expect(rounds.created).toHaveLength(0);
      await expect(view()).resolves.toMatchObject({ phase: "lobby" });
    }
  );

  it("answers 409 game-already-started to a second start, and asks rounds nothing", async () => {
    const rounds = new MemoryRounds();
    const { app, view } = await setup({ rounds });
    await app.request("/KQZT/start", startAs("ana-token"));

    const res = await app.request("/KQZT/start", startAs("ana-token"));

    expect(res.status).toBe(409);
    await expect(res.json()).resolves.toMatchObject({
      error: { code: "game-already-started" },
    });
    expect(rounds.created).toHaveLength(1);
    await expect(view()).resolves.toMatchObject({
      currentRound: 1,
      phase: "playing",
    });
  });

  it("answers 404 unknown-code for a game that does not exist", async () => {
    const { app } = await setup();

    const res = await app.request("/ZZZZ/start", startAs("ana-token"));

    expect(res.status).toBe(404);
  });
});
