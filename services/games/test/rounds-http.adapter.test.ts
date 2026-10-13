import { createServiceClient, runWithToken } from "@hmk/kit";
import { describe, expect, it } from "vitest";

import { DeckExhaustedError } from "../src/domain/game.errors.ts";
import { RoundsHttpAdapter } from "../src/infra/rounds-http.adapter.ts";

const request = {
  hostId: "u1",
  impostorMode: false,
  players: [
    { id: "u1", nickname: "Ana" },
    { id: "u2", nickname: "Luis" },
  ],
  roundSeconds: 30,
};

const json = (body: unknown, status: number) => Response.json(body, { status });

const deckExhausted: typeof fetch = () =>
  Promise.resolve(
    json({ error: { code: "deck-exhausted", message: "none left" } }, 409)
  );
const broken: typeof fetch = () =>
  Promise.resolve(json({ error: { code: "internal", message: "boom" } }, 500));

describe("rounds HTTP adapter", () => {
  it("creates a round as the host, forwarding the host's token", async () => {
    const calls: { url: string; auth: string | null; body: unknown }[] = [];
    const fetchFn: typeof fetch = (input, init) => {
      calls.push({
        auth: new Headers(init?.headers).get("authorization"),
        body: JSON.parse(String(init?.body)),
        url: String(input),
      });
      return Promise.resolve(json({ number: 1 }, 201));
    };
    const adapter = new RoundsHttpAdapter(
      createServiceClient("http://rounds.test", fetchFn)
    );

    await runWithToken("host-token", () =>
      adapter.createRound("KQZT", 1, request)
    );

    expect(calls).toStrictEqual([
      {
        auth: "Bearer host-token",
        body: request,
        url: "http://rounds.test/internal/KQZT/1",
      },
    ]);
  });

  it("turns a 409 deck-exhausted into a DeckExhaustedError", async () => {
    const adapter = new RoundsHttpAdapter(
      createServiceClient("http://rounds.test", deckExhausted)
    );

    await expect(
      adapter.createRound("KQZT", 1, request)
    ).rejects.toBeInstanceOf(DeckExhaustedError);
  });

  it("lets any other failure through", async () => {
    const adapter = new RoundsHttpAdapter(
      createServiceClient("http://rounds.test", broken)
    );

    await expect(
      adapter.createRound("KQZT", 1, request)
    ).rejects.not.toBeInstanceOf(DeckExhaustedError);
  });

  it("reads a round as the host, forwarding the host's token", async () => {
    const calls: { url: string; auth: string | null }[] = [];
    const round = {
      deadline: "2030-01-01T00:00:00.000Z",
      max: 100,
      min: 0,
      number: 2,
      solution: null,
    };
    const fetchFn: typeof fetch = (input, init) => {
      calls.push({
        auth: new Headers(init?.headers).get("authorization"),
        url: String(input),
      });
      return Promise.resolve(json(round, 200));
    };
    const adapter = new RoundsHttpAdapter(
      createServiceClient("http://rounds.test", fetchFn)
    );

    const read = await runWithToken("host-token", () =>
      adapter.getRound("KQZT", 2)
    );

    expect(read).toStrictEqual(round);
    expect(calls).toStrictEqual([
      { auth: "Bearer host-token", url: "http://rounds.test/internal/KQZT/2" },
    ]);
  });
});
