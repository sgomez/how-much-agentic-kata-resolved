import { createStaticVerifier } from "@hmk/auth";
import type { Question } from "@hmk/contracts/catalog";
import {
  CreateRoundResponse,
  RoundInternalResponse,
  RoundViewResponse,
} from "@hmk/contracts/rounds";
import { describe, expect, it } from "vitest";

import { composeRounds } from "../src/composition.ts";
import { FixedClock } from "../src/infra/fixed-clock.adapter.ts";
import { MemoryCatalog } from "../src/infra/memory-catalog.adapter.ts";

const question: Question = {
  id: "q1",
  max: 100,
  min: 0,
  pack: "general",
  solution: 42,
  text: "¿Cuántos metros mide la torre?",
  unit: "metros",
};

const authHost = { authorization: "Bearer host-token" };
const authPlayer = { authorization: "Bearer player-token" };
const authStranger = { authorization: "Bearer stranger-token" };

const setupService = (questions: readonly Question[] = [question]) => {
  const clock = new FixedClock(new Date("2026-01-01T12:00:00.000Z"));
  const catalog = new MemoryCatalog(questions);
  const verifier = createStaticVerifier({
    "host-token": { id: "host-id", name: "Host" },
    "player-token": { id: "player-id", name: "Player" },
    "stranger-token": { id: "stranger-id", name: "Stranger" },
  });

  const app = composeRounds({
    catalog,
    clock,
    verifier,
  });

  return { app, catalog, clock };
};

const post = (token: Record<string, string>, body: unknown) => ({
  body: JSON.stringify(body),
  headers: { ...token, "content-type": "application/json" },
  method: "POST",
});

const defaultCreateBody = {
  hostId: "host-id",
  impostorMode: false,
  players: [
    { id: "host-id", nickname: "Host" },
    { id: "player-id", nickname: "Player" },
  ],
  roundSeconds: 30,
};

describe("rounds routes", () => {
  it("answers /health without a token", async () => {
    const { app } = setupService();
    const res = await app.request("/health");
    expect(res.status).toBe(200);
  });

  it("rejects requests without a valid token", async () => {
    const { app } = setupService();
    const res = await app.request("/internal/GAME/1", {
      headers: { authorization: "Bearer forged" },
      method: "POST",
    });
    expect(res.status).toBe(401);
  });

  it("creating round 1 answers 201 with number", async () => {
    const { app } = setupService();
    const res = await app.request(
      "/internal/GAME/1",
      post(authHost, defaultCreateBody)
    );

    expect(res.status).toBe(201);
    const body = CreateRoundResponse.parse(await res.json());
    expect(body).toStrictEqual({ number: 1 });
  });

  it("creating round n + 1 after round n works", async () => {
    const { app } = setupService([question, { ...question, id: "q2" }]);
    await app.request("/internal/GAME/1", post(authHost, defaultCreateBody));

    const res = await app.request(
      "/internal/GAME/2",
      post(authHost, defaultCreateBody)
    );

    expect(res.status).toBe(201);
    expect(CreateRoundResponse.parse(await res.json())).toStrictEqual({
      number: 2,
    });
  });

  it("answers 409 wrong-round-number for any other number", async () => {
    const { app } = setupService();
    const res = await app.request(
      "/internal/GAME/2",
      post(authHost, defaultCreateBody)
    );

    expect(res.status).toBe(409);
    await expect(res.json()).resolves.toMatchObject({
      error: { code: "wrong-round-number" },
    });
  });

  it("asking again for a complete round answers 200 and draws no new question", async () => {
    const { app, catalog } = setupService();
    const firstRes = await app.request(
      "/internal/GAME/1",
      post(authHost, defaultCreateBody)
    );
    expect(firstRes.status).toBe(201);
    expect(catalog.draws).toHaveLength(1);

    const retryRes = await app.request(
      "/internal/GAME/1",
      post(authHost, defaultCreateBody)
    );
    expect(retryRes.status).toBe(200);
    expect(CreateRoundResponse.parse(await retryRes.json())).toStrictEqual({
      number: 1,
    });
    expect(catalog.draws).toHaveLength(1);
  });

  it("answers 409 deck-exhausted when the deck is exhausted", async () => {
    const { app } = setupService([]);
    const res = await app.request(
      "/internal/GAME/1",
      post(authHost, defaultCreateBody)
    );

    expect(res.status).toBe(409);
    await expect(res.json()).resolves.toMatchObject({
      error: { code: "deck-exhausted" },
    });
  });

  it("draws from every pack when packs is omitted", async () => {
    const { app, catalog } = setupService();
    const res = await app.request(
      "/internal/GAME/1",
      post(authHost, defaultCreateBody)
    );

    expect(res.status).toBe(201);
    expect(catalog.draws[0]?.packs).toBeUndefined();
  });

  it("answers 400 for an invalid request body", async () => {
    const { app } = setupService();
    const res = await app.request(
      "/internal/GAME/1",
      post(authHost, { invalid: true })
    );

    expect(res.status).toBe(400);
  });

  it("each player gets their view of the round", async () => {
    const { app } = setupService();
    await app.request("/internal/GAME/1", post(authHost, defaultCreateBody));

    const res = await app.request("/GAME/1", {
      headers: authPlayer,
    });

    expect(res.status).toBe(200);
    const body = RoundViewResponse.parse(await res.json());
    expect(body).toStrictEqual({
      deadline: "2026-01-01T12:00:30.000Z",
      isImpostor: false,
      max: 100,
      min: 0,
      number: 1,
      phase: "estimating",
      question: "¿Cuántos metros mide la torre?",
      roundSeconds: 30,
      serverNow: "2026-01-01T12:00:00.000Z",
      solution: null,
      unit: "metros",
    });
  });

  it("answers 403 not-a-player for a token outside the players of the round", async () => {
    const { app } = setupService();
    await app.request("/internal/GAME/1", post(authHost, defaultCreateBody));

    const res = await app.request("/GAME/1", {
      headers: authStranger,
    });

    expect(res.status).toBe(403);
    await expect(res.json()).resolves.toMatchObject({
      error: { code: "not-a-player" },
    });
  });

  it("answers 404 round-not-found for a round that does not exist", async () => {
    const { app } = setupService();
    const res = await app.request("/GAME/99", {
      headers: authPlayer,
    });

    expect(res.status).toBe(404);
    await expect(res.json()).resolves.toMatchObject({
      error: { code: "round-not-found" },
    });
  });

  it("answers internal read with number, deadline, min, max and solution", async () => {
    const { app } = setupService();
    await app.request("/internal/GAME/1", post(authHost, defaultCreateBody));

    const res = await app.request("/internal/GAME/1", {
      headers: authPlayer,
    });

    expect(res.status).toBe(200);
    const body = RoundInternalResponse.parse(await res.json());
    expect(body).toStrictEqual({
      deadline: "2026-01-01T12:00:30.000Z",
      max: 100,
      min: 0,
      number: 1,
      solution: null,
    });
  });

  it("answers 403 not-a-player for internal read when token is not among players", async () => {
    const { app } = setupService();
    await app.request("/internal/GAME/1", post(authHost, defaultCreateBody));

    const res = await app.request("/internal/GAME/1", {
      headers: authStranger,
    });

    expect(res.status).toBe(403);
    await expect(res.json()).resolves.toMatchObject({
      error: { code: "not-a-player" },
    });
  });

  it("answers 404 round-not-found for internal read when round does not exist", async () => {
    const { app } = setupService();
    const res = await app.request("/internal/GAME/99", {
      headers: authPlayer,
    });

    expect(res.status).toBe(404);
    await expect(res.json()).resolves.toMatchObject({
      error: { code: "round-not-found" },
    });
  });

  it("1 ms before deadline, round is estimating and solution is null", async () => {
    const { app, clock } = setupService();
    await app.request("/internal/GAME/1", post(authHost, defaultCreateBody));

    // 1 ms before deadline: 2026-01-01T12:00:29.999Z
    clock.set(new Date("2026-01-01T12:00:29.999Z"));

    const viewRes = await app.request("/GAME/1", {
      headers: authPlayer,
    });
    const view = RoundViewResponse.parse(await viewRes.json());
    expect(view.phase).toBe("estimating");
    expect(view.solution).toBeNull();

    const internalRes = await app.request("/internal/GAME/1", {
      headers: authPlayer,
    });
    const internal = RoundInternalResponse.parse(await internalRes.json());
    expect(internal.solution).toBeNull();
  });

  it("moving fixed clock to deadline turns phase to revealed and reveals solution", async () => {
    const { app, clock } = setupService();
    await app.request("/internal/GAME/1", post(authHost, defaultCreateBody));

    // At deadline: 2026-01-01T12:00:30.000Z
    clock.set(new Date("2026-01-01T12:00:30.000Z"));

    const viewRes = await app.request("/GAME/1", {
      headers: authPlayer,
    });
    const view = RoundViewResponse.parse(await viewRes.json());
    expect(view.phase).toBe("revealed");
    expect(view.solution).toBe(42);

    const internalRes = await app.request("/internal/GAME/1", {
      headers: authPlayer,
    });
    const internal = RoundInternalResponse.parse(await internalRes.json());
    expect(internal.solution).toBe(42);
  });
});
