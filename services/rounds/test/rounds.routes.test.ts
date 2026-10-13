import { createStaticVerifier } from "@hmk/auth";
import type { Question } from "@hmk/contracts/catalog";
import { CreateRoundResponse, RoundViewResponse } from "@hmk/contracts/rounds";
import { describe, expect, it } from "vitest";

import { composeRounds } from "../src/composition.ts";
import { FixedClock } from "../src/infra/fixed-clock.adapter.ts";
import { MemoryCatalog } from "../src/infra/memory-catalog.adapter.ts";
import { MemoryImpostorAdapter } from "../src/infra/memory-impostor.adapter.ts";

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

const setupService = (
  questions: readonly Question[] = [question],
  impostor: MemoryImpostorAdapter = new MemoryImpostorAdapter("player-id")
) => {
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
    impostor,
    verifier,
  });

  return { app, catalog, clock, impostor };
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

  it("in impostor mode Impostor receives every player, the host and the stored deadline; outside impostor mode it is never called", async () => {
    const { app, impostor } = setupService([question, question]);

    // Outside impostor mode:
    const normalRes = await app.request(
      "/internal/GAME/1",
      post(authHost, defaultCreateBody)
    );
    expect(normalRes.status).toBe(201);
    expect(impostor.calls).toHaveLength(0);

    // In impostor mode:
    const impostorRes = await app.request(
      "/internal/GAME_IMPOSTOR/1",
      post(authHost, { ...defaultCreateBody, impostorMode: true })
    );
    expect(impostorRes.status).toBe(201);

    expect(impostor.calls).toHaveLength(1);
    expect(impostor.calls[0]).toStrictEqual({
      candidates: defaultCreateBody.players,
      deadline: new Date("2026-01-01T12:00:30.000Z"),
      gameCode: "GAME_IMPOSTOR",
      hostId: "host-id",
      roundNumber: 1,
    });
  });

  it("when Impostor fails, answers 5xx and the round reads 404", async () => {
    const impostor = new MemoryImpostorAdapter("player-id");
    impostor.setError(new Error("Impostor service error"));
    const { app } = setupService([question], impostor);

    const failRes = await app.request(
      "/internal/GAME/1",
      post(authHost, { ...defaultCreateBody, impostorMode: true })
    );
    expect(failRes.status).toBeGreaterThanOrEqual(500);

    // While reserved, round reads 404 for players:
    const readRes = await app.request("/GAME/1", { headers: authPlayer });
    expect(readRes.status).toBe(404);
  });

  it("retrying after Impostor failure draws no new question, sends same deadline and answers 201", async () => {
    const impostor = new MemoryImpostorAdapter("player-id");
    impostor.setError(new Error("Impostor service error"));
    const { app, catalog, clock } = setupService([question], impostor);

    await app.request(
      "/internal/GAME/1",
      post(authHost, { ...defaultCreateBody, impostorMode: true })
    );

    // Advance clock so that a new deadline would be different
    clock.set(new Date("2026-01-01T12:00:10.000Z"));
    impostor.setError(null);

    // Retry
    const retryRes = await app.request(
      "/internal/GAME/1",
      post(authHost, { ...defaultCreateBody, impostorMode: true })
    );
    expect(retryRes.status).toBe(201);

    // Draws no new question
    expect(catalog.draws).toHaveLength(1);

    // Sends the same deadline
    expect(impostor.calls[1]?.deadline).toStrictEqual(
      new Date("2026-01-01T12:00:30.000Z")
    );

    const successRead = await app.request("/GAME/1", { headers: authPlayer });
    expect(successRead.status).toBe(200);
  });

  it("the impostor's view has question: null, isImpostor: true, and no impostorId", async () => {
    const impostor = new MemoryImpostorAdapter("player-id");
    const { app } = setupService([question], impostor);

    await app.request(
      "/internal/GAME/1",
      post(authHost, { ...defaultCreateBody, impostorMode: true })
    );

    const res = await app.request("/GAME/1", { headers: authPlayer });
    expect(res.status).toBe(200);
    const json = (await res.json()) as Record<string, unknown>;
    const body = RoundViewResponse.parse(json);
    expect(body.isImpostor).toBeTruthy();
    expect(body.question).toBeNull();
    expect("impostorId" in json).toBeFalsy();
  });

  it("an innocent player's view sees the question, isImpostor: false, and no impostorId", async () => {
    const impostor = new MemoryImpostorAdapter("player-id");
    const { app } = setupService([question], impostor);

    await app.request(
      "/internal/GAME/1",
      post(authHost, { ...defaultCreateBody, impostorMode: true })
    );

    const res = await app.request("/GAME/1", { headers: authHost });
    expect(res.status).toBe(200);
    const json = (await res.json()) as Record<string, unknown>;
    const body = RoundViewResponse.parse(json);
    expect(body.isImpostor).toBeFalsy();
    expect(body.question).toBe("¿Cuántos metros mide la torre?");
    expect("impostorId" in json).toBeFalsy();
  });
});
