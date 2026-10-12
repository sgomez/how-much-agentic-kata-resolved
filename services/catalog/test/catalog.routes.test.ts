import { createStaticVerifier } from "@hmk/auth";
import {
  DrawQuestionResponse,
  ListPacksResponse,
} from "@hmk/contracts/catalog";
import { describe, expect, it } from "vitest";

import { composeCatalog } from "../src/composition.ts";
import { MemoryQuestionSource } from "../src/infra/memory-question-source.adapter.ts";
import { SequenceRandom } from "../src/infra/sequence-random.adapter.ts";
import { syntheticQuestion } from "./fixtures.ts";

const auth = { authorization: "Bearer ana-token" };

const catalog = ({ testMode = false } = {}) =>
  composeCatalog({
    random: new SequenceRandom([0]),
    source: new MemoryQuestionSource([
      syntheticQuestion(1),
      syntheticQuestion(2, { pack: "synthetic-b" }),
    ]),
    testMode,
    verifier: createStaticVerifier({ "ana-token": { id: "u1", name: "Ana" } }),
  });

const post = (body: unknown) => ({
  body: JSON.stringify(body),
  headers: { ...auth, "content-type": "application/json" },
  method: "POST",
});

describe("catalog routes", () => {
  it("answers /health without a token", async () => {
    const res = await catalog().request("/health");

    expect(res.status).toBe(200);
  });

  it("rejects requests without a valid token", async () => {
    const res = await catalog().request("/packs", {
      headers: { authorization: "Bearer forged" },
    });

    expect(res.status).toBe(401);
  });

  it("lists the packs", async () => {
    const res = await catalog().request("/packs", { headers: auth });

    expect(
      ListPacksResponse.parse(await res.json()).packs.map((p) => p.name)
    ).toStrictEqual(["synthetic-a", "synthetic-b"]);
  });

  it("draws a question for a game", async () => {
    const res = await catalog().request("/internal/decks/g1/draws", post({}));

    expect(res.status).toBe(201);
    expect(DrawQuestionResponse.parse(await res.json()).question.id).toBe("q1");
  });

  it("answers 409 when the deck is exhausted", async () => {
    const app = catalog();
    await app.request(
      "/internal/decks/g1/draws",
      post({ packs: ["synthetic-b"] })
    );

    const res = await app.request(
      "/internal/decks/g1/draws",
      post({ packs: ["synthetic-b"] })
    );

    expect(res.status).toBe(409);
    await expect(res.json()).resolves.toMatchObject({
      error: { code: "deck-exhausted" },
    });
  });

  it("answers 400 to an invalid body", async () => {
    const res = await catalog().request(
      "/internal/decks/g1/draws",
      post({ packs: [] })
    );

    expect(res.status).toBe(400);
  });

  it("hides the test endpoint outside test mode", async () => {
    const res = await catalog().request(
      "/test/next-question",
      post(syntheticQuestion(9))
    );

    expect(res.status).toBe(404);
  });

  it("draws the rigged question next in test mode", async () => {
    const app = catalog({ testMode: true });
    const rigged = syntheticQuestion(99, {
      id: "rigged",
      max: 1000,
      solution: 270,
    });

    await app.request("/test/next-question", post(rigged));
    const res = await app.request("/internal/decks/g7/draws", post({}));

    expect(DrawQuestionResponse.parse(await res.json()).question).toStrictEqual(
      rigged
    );
  });

  it("replaces a rigged question that was never drawn, and draws randomly afterwards", async () => {
    const app = catalog({ testMode: true });
    const stale = syntheticQuestion(98, { id: "stale" });
    const rigged = syntheticQuestion(99, { id: "rigged" });

    await app.request("/test/next-question", post(stale));
    await app.request("/test/next-question", post(rigged));
    const first = await app.request("/internal/decks/g8/draws", post({}));
    const second = await app.request("/internal/decks/g8/draws", post({}));

    expect(DrawQuestionResponse.parse(await first.json()).question.id).toBe(
      "rigged"
    );
    expect(DrawQuestionResponse.parse(await second.json()).question.id).toBe(
      "q1"
    );
  });
});
