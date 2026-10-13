import { createStaticVerifier } from "@hmk/auth";
import {
  CreateGameResponse,
  GameView,
  ListPlayersResponse,
} from "@hmk/contracts/games";
import { describe, expect, it } from "vitest";

import { composeGames } from "../src/composition.ts";
import { FixedCodeGenerator } from "../src/infra/fixed-code-generator.adapter.ts";
import { MemoryImpostor } from "../src/infra/memory-impostor.adapter.ts";
import { MemoryRounds } from "../src/infra/memory-rounds.adapter.ts";

const verifier = createStaticVerifier({
  "ana-token": { id: "u1", name: "Ana" },
  "ben-token": { id: "u2", name: "Ben" },
  "ben-spaced-token": { id: "u3", name: "  bEN " },
});
const auth = { authorization: "Bearer ana-token" };
const asBen = { authorization: "Bearer ben-token" };

const games = (codes: readonly string[] = ["KQZT"]) =>
  composeGames({
    codes: new FixedCodeGenerator(codes),
    impostor: new MemoryImpostor(),
    rounds: new MemoryRounds(),
    verifier,
  });

const post = (body: unknown) => ({
  body: JSON.stringify(body),
  headers: { ...auth, "content-type": "application/json" },
  method: "POST",
});

const lobby = async () => {
  const app = games();
  await app.request("/", post({ impostorMode: false, roundSeconds: 30 }));
  return app;
};

const join = (
  app: Awaited<ReturnType<typeof lobby>>,
  code: string,
  headers = asBen
) => app.request(`/${code}/players`, { headers, method: "POST" });
const nicknames = async (app: Awaited<ReturnType<typeof lobby>>) => {
  const res = await app.request("/KQZT", { headers: auth });
  const view = GameView.parse(await res.json());
  return view.players.map((p) => p.nickname);
};

describe("games routes", () => {
  it("creates a game and answers 201 with its code", async () => {
    const res = await games().request(
      "/",
      post({ impostorMode: false, roundSeconds: 30 })
    );

    expect(res.status).toBe(201);
    expect(CreateGameResponse.parse(await res.json()).code).toBe("KQZT");
  });

  it("shows a new game in the lobby with its creator as host and only player", async () => {
    const app = games();
    await app.request("/", post({ impostorMode: false, roundSeconds: 30 }));

    const res = await app.request("/KQZT", { headers: auth });

    expect(res.status).toBe(200);
    expect(GameView.parse(await res.json())).toStrictEqual({
      code: "KQZT",
      currentRound: null,
      hostId: "u1",
      phase: "lobby",
      players: [{ id: "u1", nickname: "Ana" }],
      settings: {
        impostorMode: false,
        packs: [],
        roundSeconds: 30,
        rounds: 5,
      },
    });
  });

  it("keeps the settings the host chose", async () => {
    const app = games();
    await app.request(
      "/",
      post({
        impostorMode: true,
        packs: ["science"],
        roundSeconds: 45,
        rounds: 8,
      })
    );

    const res = await app.request("/KQZT", { headers: auth });
    const view = GameView.parse(await res.json());

    expect(view.settings).toStrictEqual({
      impostorMode: true,
      packs: ["science"],
      roundSeconds: 45,
      rounds: 8,
    });
  });

  it("finds a game whatever the case of the code", async () => {
    const app = games();
    await app.request("/", post({ impostorMode: false, roundSeconds: 30 }));

    const res = await app.request("/kqzt", { headers: auth });

    expect(res.status).toBe(200);
    expect(GameView.parse(await res.json()).code).toBe("KQZT");
  });

  it("gives each game a code no other game has", async () => {
    const app = games(["KQZT", "KQZT", "MNPR"]);
    await app.request("/", post({ impostorMode: false, roundSeconds: 30 }));

    const res = await app.request(
      "/",
      post({ impostorMode: false, roundSeconds: 30 })
    );

    expect(CreateGameResponse.parse(await res.json()).code).toBe("MNPR");
  });

  it.each(["ZZZZ", "NO-SUCH-GAME", "x", "12345678901234567890"])(
    "answers 404 unknown-code to the code %s, never 400",
    async (code) => {
      const res = await games().request(`/${code}`, { headers: auth });

      expect(res.status).toBe(404);
      await expect(res.json()).resolves.toMatchObject({
        error: { code: "unknown-code" },
      });
    }
  );

  it("answers 400 to an invalid body", async () => {
    const res = await games().request("/", post({ roundSeconds: 30 }));

    expect(res.status).toBe(400);
  });

  it("rejects requests without a valid token", async () => {
    const res = await games().request("/KQZT");

    expect(res.status).toBe(401);
  });

  describe("joining", () => {
    it("adds the player to the lobby after the others", async () => {
      const app = await lobby();

      const res = await join(app, "KQZT");

      expect(res.status).toBe(204);
      await expect(nicknames(app)).resolves.toStrictEqual(["Ana", "Ben"]);
    });

    it("leaves the player in once when they join twice", async () => {
      const app = await lobby();
      await join(app, "KQZT");

      const res = await join(app, "KQZT");

      expect(res.status).toBe(204);
      await expect(nicknames(app)).resolves.toStrictEqual(["Ana", "Ben"]);
    });

    it("finds the game whatever the case of the code", async () => {
      const app = await lobby();

      const res = await join(app, "kqzt");

      expect(res.status).toBe(204);
      await expect(nicknames(app)).resolves.toStrictEqual(["Ana", "Ben"]);
    });

    it("answers 404 unknown-code when no game has the code", async () => {
      const res = await join(await lobby(), "ZZZZ");

      expect(res.status).toBe(404);
      await expect(res.json()).resolves.toMatchObject({
        error: { code: "unknown-code" },
      });
    });

    it("answers 409 game-already-started once the game has started, and adds nobody", async () => {
      const app = await lobby();
      await join(app, "KQZT");
      await app.request("/KQZT/start", { headers: auth, method: "POST" });

      const res = await join(app, "KQZT", {
        authorization: "Bearer ben-spaced-token",
      });

      expect(res.status).toBe(409);
      await expect(res.json()).resolves.toMatchObject({
        error: { code: "game-already-started" },
      });
      await expect(nicknames(app)).resolves.toStrictEqual(["Ana", "Ben"]);
    });

    it("answers 204 to a player already in who joins again after the game started", async () => {
      const app = await lobby();
      await join(app, "KQZT");
      await app.request("/KQZT/start", { headers: auth, method: "POST" });

      const res = await join(app, "KQZT");

      expect(res.status).toBe(204);
      await expect(nicknames(app)).resolves.toStrictEqual(["Ana", "Ben"]);
    });

    it("answers 409 nickname-taken to another player with the same nickname, ignoring case and spaces", async () => {
      const app = await lobby();
      await join(app, "KQZT");

      const res = await join(app, "KQZT", {
        authorization: "Bearer ben-spaced-token",
      });

      expect(res.status).toBe(409);
      await expect(res.json()).resolves.toMatchObject({
        error: { code: "nickname-taken" },
      });
      await expect(nicknames(app)).resolves.toStrictEqual(["Ana", "Ben"]);
    });

    it("lists every player in joining order for other services", async () => {
      const app = await lobby();
      await join(app, "KQZT");

      const res = await app.request("/internal/KQZT/players", {
        headers: auth,
      });

      expect(res.status).toBe(200);
      expect(ListPlayersResponse.parse(await res.json())).toStrictEqual({
        impostorMode: false,
        players: [
          { id: "u1", nickname: "Ana" },
          { id: "u2", nickname: "Ben" },
        ],
      });
    });

    it("answers 404 unknown-code to the internal list of an unknown game", async () => {
      const app = await lobby();

      const res = await app.request("/internal/ZZZZ/players", {
        headers: auth,
      });

      expect(res.status).toBe(404);
    });
  });
});
