import { createStaticVerifier } from "@hmk/auth";
import {
  ListEstimatesResponse,
  SendEstimateResponse,
} from "@hmk/contracts/scoring";
import { ServiceCallError } from "@hmk/kit";
import { describe, expect, it } from "vitest";

import { composeScoring } from "../src/composition.ts";
import { MemoryGamesAdapter } from "../src/infra/memory-games.adapter.ts";
import { MemoryRoundsAdapter } from "../src/infra/memory-rounds.adapter.ts";

const authAna = { authorization: "Bearer ana-token" };
const authBob = { authorization: "Bearer bob-token" };

const createTestApp = () => {
  const rounds = new MemoryRoundsAdapter();
  const games = new MemoryGamesAdapter();
  rounds.setRound("GAME", {
    number: 1,
    deadline: "2026-10-13T10:00:00.000Z",
    min: 0,
    max: 100,
    solution: null,
  });
  games.setGame("GAME", {
    players: [
      { id: "ana-id", nickname: "Ana" },
      { id: "bob-id", nickname: "Bob" },
    ],
    impostorMode: false,
  });

  const app = composeScoring({
    games,
    rounds,
    verifier: createStaticVerifier({
      "ana-token": { id: "ana-id", name: "Ana" },
      "bob-token": { id: "bob-id", name: "Bob" },
    }),
  });

  return { app, games, rounds };
};

const post = (auth: Record<string, string>, body: unknown) => ({
  body: JSON.stringify(body),
  headers: { ...auth, "content-type": "application/json" },
  method: "POST",
});

describe("scoring routes", () => {
  it("answers /health without a token", async () => {
    const { app } = createTestApp();
    const res = await app.request("/health");

    expect(res.status).toBe(200);
  });

  it("rejects requests without a token with 401 unauthenticated", async () => {
    const { app } = createTestApp();
    const res = await app.request("/GAME/1/estimates");

    expect(res.status).toBe(401);
  });

  it("sends an estimate and returns 200 with stored value", async () => {
    const { app } = createTestApp();
    const res = await app.request(
      "/GAME/1/estimates",
      post(authAna, { value: 42 })
    );

    expect(res.status).toBe(200);
    const body = SendEstimateResponse.parse(await res.json());
    expect(body).toStrictEqual({ value: 42 });
  });

  it("lists answered players and asking player's own estimate", async () => {
    const { app } = createTestApp();
    await app.request("/GAME/1/estimates", post(authAna, { value: 42 }));

    const resAna = await app.request("/GAME/1/estimates", { headers: authAna });
    expect(resAna.status).toBe(200);
    const bodyAna = ListEstimatesResponse.parse(await resAna.json());
    expect(bodyAna).toStrictEqual({
      answered: ["ana-id"],
      myEstimate: 42,
    });

    const resBob = await app.request("/GAME/1/estimates", { headers: authBob });
    expect(resBob.status).toBe(200);
    const bodyBob = ListEstimatesResponse.parse(await resBob.json());
    expect(bodyBob).toStrictEqual({
      answered: ["ana-id"],
      myEstimate: null,
    });
  });

  it("returns empty answered and null estimate for an unstarted/unknown round without calling rounds", async () => {
    const { app } = createTestApp();
    const res = await app.request("/UNKNOWN/99/estimates", {
      headers: authAna,
    });

    expect(res.status).toBe(200);
    const body = ListEstimatesResponse.parse(await res.json());
    expect(body).toStrictEqual({
      answered: [],
      myEstimate: null,
    });
  });

  it("replaces a player's previous estimate", async () => {
    const { app } = createTestApp();
    await app.request("/GAME/1/estimates", post(authAna, { value: 10 }));
    const res = await app.request(
      "/GAME/1/estimates",
      post(authAna, { value: 20 })
    );

    expect(res.status).toBe(200);
    const body = SendEstimateResponse.parse(await res.json());
    expect(body).toStrictEqual({ value: 20 });

    const listRes = await app.request("/GAME/1/estimates", {
      headers: authAna,
    });
    const listBody = ListEstimatesResponse.parse(await listRes.json());
    expect(listBody).toStrictEqual({
      answered: ["ana-id"],
      myEstimate: 20,
    });
  });

  it("rejects an estimate below min or above max with 422 out-of-range", async () => {
    const { app } = createTestApp();
    const resUnder = await app.request(
      "/GAME/1/estimates",
      post(authAna, { value: -1 })
    );
    expect(resUnder.status).toBe(422);
    await expect(resUnder.json()).resolves.toMatchObject({
      error: { code: "out-of-range" },
    });

    const resOver = await app.request(
      "/GAME/1/estimates",
      post(authAna, { value: 101 })
    );
    expect(resOver.status).toBe(422);
    await expect(resOver.json()).resolves.toMatchObject({
      error: { code: "out-of-range" },
    });
  });

  it("rejects an invalid request body with 400 invalid-request", async () => {
    const { app } = createTestApp();
    const res = await app.request(
      "/GAME/1/estimates",
      post(authAna, { value: "not a number" })
    );

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toMatchObject({
      error: { code: "invalid-request" },
    });
  });

  it("rejects when round is revealed with 409 round-revealed", async () => {
    const { app, rounds } = createTestApp();
    rounds.setRound("GAME", {
      number: 1,
      deadline: "2026-10-13T10:00:00.000Z",
      min: 0,
      max: 100,
      solution: 50,
    });

    const res = await app.request(
      "/GAME/1/estimates",
      post(authAna, { value: 50 })
    );

    expect(res.status).toBe(409);
    await expect(res.json()).resolves.toMatchObject({
      error: { code: "round-revealed" },
    });
  });

  it("passes through 404 round-not-found from rounds", async () => {
    const { app } = createTestApp();
    const res = await app.request(
      "/GAME/99/estimates",
      post(authAna, { value: 50 })
    );

    expect(res.status).toBe(404);
    await expect(res.json()).resolves.toMatchObject({
      error: { code: "round-not-found" },
    });
  });

  it("passes through 403 not-a-player from rounds", async () => {
    const { app, rounds } = createTestApp();
    const notAPlayerError = new ServiceCallError(
      403,
      "not-a-player",
      "Not a player"
    );
    rounds.setError("GAME", 1, notAPlayerError);

    // If rounds throws NotAPlayer domain error directly:
    const { NotAPlayer } = await import("../src/domain/scoring.errors.ts");
    rounds.setError("GAME", 1, new NotAPlayer());

    const res = await app.request(
      "/GAME/1/estimates",
      post(authAna, { value: 50 })
    );

    expect(res.status).toBe(403);
    await expect(res.json()).resolves.toMatchObject({
      error: { code: "not-a-player" },
    });
  });

  it("returns scoreboard for all players in the game", async () => {
    const { app, rounds } = createTestApp();

    // Ana estimates 50 (exact hit: 5 points), Bob estimates 40 (0 points) while round is estimating
    await app.request("/GAME/1/estimates", post(authAna, { value: 50 }));
    await app.request("/GAME/1/estimates", post(authBob, { value: 40 }));

    // Now round 1 is revealed with solution 50
    rounds.setRound("GAME", {
      number: 1,
      min: 0,
      max: 100,
      solution: 50,
      deadline: "2026-10-13T10:00:00.000Z",
    });

    const res = await app.request("/GAME/scoreboard", { headers: authAna });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toStrictEqual({
      players: [
        { id: "ana-id", nickname: "Ana", points: 5 },
        { id: "bob-id", nickname: "Bob", points: 0 },
      ],
    });
  });

  it("returns 404 unknown-code on scoreboard when game does not exist", async () => {
    const { app } = createTestApp();
    const res = await app.request("/UNKNOWN/scoreboard", { headers: authAna });

    expect(res.status).toBe(404);
    await expect(res.json()).resolves.toMatchObject({
      error: { code: "unknown-code" },
    });
  });

  it("returns reveal when round is revealed with estimates sorted by distance", async () => {
    const { app, rounds } = createTestApp();

    await app.request("/GAME/1/estimates", post(authAna, { value: 60 }));
    await app.request("/GAME/1/estimates", post(authBob, { value: 50 }));

    rounds.setRound("GAME", {
      deadline: "2026-10-13T10:00:00.000Z",
      max: 100,
      min: 0,
      number: 1,
      solution: 50,
    });

    const res = await app.request("/GAME/1/reveal", { headers: authAna });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toStrictEqual({
      estimates: [
        {
          distance: 0,
          id: "bob-id",
          nickname: "Bob",
          points: 5,
          value: 50,
        },
        {
          distance: 10,
          id: "ana-id",
          nickname: "Ana",
          points: 0,
          value: 60,
        },
      ],
      solution: 50,
    });
  });

  it("returns 409 round-not-revealed when round is still estimating", async () => {
    const { app } = createTestApp();

    const res = await app.request("/GAME/1/reveal", { headers: authAna });

    expect(res.status).toBe(409);
    await expect(res.json()).resolves.toMatchObject({
      error: { code: "round-not-revealed" },
    });
  });

  it("returns 404 round-not-found when round does not exist", async () => {
    const { app } = createTestApp();

    const res = await app.request("/GAME/99/reveal", { headers: authAna });

    expect(res.status).toBe(404);
    await expect(res.json()).resolves.toMatchObject({
      error: { code: "round-not-found" },
    });
  });
});
