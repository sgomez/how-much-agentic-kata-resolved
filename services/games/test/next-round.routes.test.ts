import { createStaticVerifier } from "@hmk/auth";
import { GameView } from "@hmk/contracts/games";
import { describe, expect, it } from "vitest";

import { composeGames } from "../src/composition.ts";
import { Game } from "../src/domain/game.aggregate.ts";
import type { Player, Settings } from "../src/domain/game.aggregate.ts";
import { DeckExhaustedError } from "../src/domain/game.errors.ts";
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

const settings: Settings = {
  impostorMode: false,
  packs: [],
  roundSeconds: 30,
  rounds: 3,
};

const asAna = { headers: { authorization: "Bearer ana-token" } };
const nextAs = (token: string, body: unknown) => ({
  body: JSON.stringify(body),
  headers: {
    authorization: `Bearer ${token}`,
    "content-type": "application/json",
  },
  method: "POST",
});

/** A game already playing `currentRound`, put straight into the repository. */
const setup = async ({
  currentRound = 1,
  phase = "playing",
  settings: chosen = settings,
}: {
  currentRound?: number;
  phase?: "lobby" | "playing" | "finished";
  settings?: Settings;
} = {}) => {
  const rounds = new MemoryRounds();
  const impostor = new MemoryImpostor();
  const repository = new MemoryGameRepository();
  await repository.save(
    Game.restore({
      code: "KQZT",
      currentRound: phase === "lobby" ? null : currentRound,
      host: ana,
      phase,
      players: [ana, luis],
      settings: chosen,
    })
  );
  const app = composeGames({
    codes: new FixedCodeGenerator(["KQZT"]),
    games: repository,
    impostor,
    rounds,
    verifier,
  });
  const view = async () => {
    const res = await app.request("/KQZT", asAna);
    return GameView.parse(await res.json());
  };
  const moveOn = (round: number, token = "ana-token") =>
    app.request("/KQZT/next", nextAs(token, { round }));
  return { app, impostor, moveOn, rounds, view };
};

const errorCode = async (res: Response) =>
  ((await res.json()) as { error: { code: string } }).error.code;

describe("next round", () => {
  it("raises the current round once rounds has created the next one", async () => {
    const { moveOn, rounds, view } = await setup();
    rounds.reveal("KQZT", 1, 42);

    const res = await moveOn(1);

    expect(res.status).toBe(204);
    await expect(view()).resolves.toMatchObject({
      currentRound: 2,
      phase: "playing",
    });
    expect(rounds.created).toStrictEqual([
      {
        code: "KQZT",
        number: 2,
        request: {
          hostId: "u1",
          impostorMode: false,
          players: [
            { id: "u1", nickname: "Ana" },
            { id: "u2", nickname: "Luis" },
          ],
          roundSeconds: 30,
        },
      },
    ]);
  });

  it("moves on once when the host sends the same round twice", async () => {
    const { moveOn, rounds, view } = await setup();
    rounds.reveal("KQZT", 1, 42);

    await moveOn(1);
    const res = await moveOn(1);

    expect(res.status).toBe(204);
    await expect(view()).resolves.toMatchObject({ currentRound: 2 });
    expect(rounds.created).toHaveLength(1);
  });

  it("moves on once when two requests for the same round overlap", async () => {
    const { moveOn, rounds, view } = await setup();
    rounds.reveal("KQZT", 1, 42);

    await Promise.all([moveOn(1), moveOn(1)]);

    await expect(view()).resolves.toMatchObject({ currentRound: 2 });
  });

  it("answers 409 wrong-round when the round is ahead of the current one", async () => {
    const { moveOn, view } = await setup();

    const res = await moveOn(2);

    expect(res.status).toBe(409);
    await expect(errorCode(res)).resolves.toBe("wrong-round");
    await expect(view()).resolves.toMatchObject({ currentRound: 1 });
  });

  it("answers 409 round-not-revealed while the solution is null, and does not move", async () => {
    const { moveOn, rounds, view } = await setup();
    rounds.add("KQZT", 1);

    const res = await moveOn(1);

    expect(res.status).toBe(409);
    await expect(errorCode(res)).resolves.toBe("round-not-revealed");
    await expect(view()).resolves.toMatchObject({ currentRound: 1 });
    expect(rounds.created).toHaveLength(0);
  });

  it("answers 500 and does not move when rounds fails", async () => {
    const { moveOn, view } = await setup();

    const res = await moveOn(1);

    expect(res.status).toBe(500);
    await expect(view()).resolves.toMatchObject({ currentRound: 1 });
  });

  it("answers 403 not-the-host to another player", async () => {
    const { moveOn, rounds, view } = await setup();
    rounds.reveal("KQZT", 1, 42);

    const res = await moveOn(1, "luis-token");

    expect(res.status).toBe(403);
    await expect(errorCode(res)).resolves.toBe("not-the-host");
    await expect(view()).resolves.toMatchObject({ currentRound: 1 });
  });

  it("answers 409 game-not-started in the lobby", async () => {
    const { moveOn } = await setup({ phase: "lobby" });

    const res = await moveOn(1);

    expect(res.status).toBe(409);
    await expect(errorCode(res)).resolves.toBe("game-not-started");
  });

  it("answers 404 unknown-code for a game that does not exist", async () => {
    const { app } = await setup();

    const res = await app.request(
      "/ZZZZ/next",
      nextAs("ana-token", { round: 1 })
    );

    expect(res.status).toBe(404);
  });

  it("answers 400 when the body has no round", async () => {
    const { app } = await setup();

    const res = await app.request("/KQZT/next", nextAs("ana-token", {}));

    expect(res.status).toBe(400);
  });

  describe("the end of the game", () => {
    it("finishes the game after the last round, keeping the current round", async () => {
      const { moveOn, rounds, view } = await setup({ currentRound: 3 });
      rounds.reveal("KQZT", 3, 42);

      const res = await moveOn(3);

      expect(res.status).toBe(204);
      await expect(view()).resolves.toMatchObject({
        currentRound: 3,
        phase: "finished",
      });
      expect(rounds.created).toHaveLength(0);
    });

    it("finishes the game when rounds has no question left, keeping the current round", async () => {
      const { moveOn, rounds, view } = await setup({ currentRound: 2 });
      rounds.reveal("KQZT", 2, 42);
      rounds.failWith(new DeckExhaustedError());

      const res = await moveOn(2);

      expect(res.status).toBe(204);
      await expect(view()).resolves.toMatchObject({
        currentRound: 2,
        phase: "finished",
      });
    });

    it("answers 204 and changes nothing on a finished game", async () => {
      const { moveOn, rounds, view } = await setup({
        currentRound: 3,
        phase: "finished",
      });

      const res = await moveOn(3);

      expect(res.status).toBe(204);
      await expect(view()).resolves.toMatchObject({
        currentRound: 3,
        phase: "finished",
      });
      expect(rounds.created).toHaveLength(0);
    });

    it("answers 403 to another player on a finished game", async () => {
      const { moveOn } = await setup({ currentRound: 3, phase: "finished" });

      const res = await moveOn(3, "luis-token");

      expect(res.status).toBe(403);
    });
  });

  describe("in impostor mode", () => {
    const impostorSettings: Settings = { ...settings, impostorMode: true };

    it("answers 409 voting-not-over while the verdict is null, and does not move", async () => {
      const { impostor, moveOn, rounds, view } = await setup({
        settings: impostorSettings,
      });
      rounds.reveal("KQZT", 1, 42);
      impostor.setVerdict("KQZT", 1, null);

      const res = await moveOn(1);

      expect(res.status).toBe(409);
      await expect(errorCode(res)).resolves.toBe("voting-not-over");
      await expect(view()).resolves.toMatchObject({ currentRound: 1 });
      expect(rounds.created).toHaveLength(0);
    });

    it("moves on once the verdict is known", async () => {
      const { impostor, moveOn, rounds, view } = await setup({
        settings: impostorSettings,
      });
      rounds.reveal("KQZT", 1, 42);
      impostor.setVerdict("KQZT", 1, "caught");

      const res = await moveOn(1);

      expect(res.status).toBe(204);
      await expect(view()).resolves.toMatchObject({ currentRound: 2 });
      expect(rounds.created[0]?.request.impostorMode).toBeTruthy();
    });

    it("answers 500 and does not move when impostor has no verdict for the round", async () => {
      const { moveOn, rounds, view } = await setup({
        settings: impostorSettings,
      });
      rounds.reveal("KQZT", 1, 42);

      const res = await moveOn(1);

      expect(res.status).toBe(500);
      await expect(view()).resolves.toMatchObject({ currentRound: 1 });
    });

    it("guards the last round too", async () => {
      const { impostor, moveOn, rounds, view } = await setup({
        currentRound: 3,
        settings: impostorSettings,
      });
      rounds.reveal("KQZT", 3, 42);
      impostor.setVerdict("KQZT", 3, null);

      const res = await moveOn(3);

      expect(res.status).toBe(409);
      await expect(errorCode(res)).resolves.toBe("voting-not-over");
      await expect(view()).resolves.toMatchObject({ phase: "playing" });
    });
  });
});
