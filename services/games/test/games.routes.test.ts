import { createStaticVerifier } from "@hmk/auth";
import { CreateGameResponse, GameView } from "@hmk/contracts/games";
import { describe, expect, it } from "vitest";

import { composeGames } from "../src/composition.ts";
import { FixedCodeGenerator } from "../src/infra/fixed-code-generator.adapter.ts";
import { MemoryRounds } from "../src/infra/memory-rounds.adapter.ts";

const verifier = createStaticVerifier({
  "ana-token": { id: "u1", name: "Ana" },
});
const auth = { authorization: "Bearer ana-token" };

const games = (codes: readonly string[] = ["KQZT"]) =>
  composeGames({
    codes: new FixedCodeGenerator(codes),
    rounds: new MemoryRounds(),
    verifier,
  });

const post = (body: unknown) => ({
  body: JSON.stringify(body),
  headers: { ...auth, "content-type": "application/json" },
  method: "POST",
});

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
});
