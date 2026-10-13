import { createStaticVerifier } from "@hmk/auth";
import {
  ChooseImpostorResponse,
  VerdictResponse,
} from "@hmk/contracts/impostor";
import { describe, expect, it } from "vitest";

import { composeImpostor } from "../src/composition.ts";
import { FixedClock } from "../src/infra/fixed-clock.adapter.ts";
import { SequenceRandom } from "../src/infra/sequence-random.adapter.ts";

const auth = { authorization: "Bearer ana-token" };
const deadline = "2026-01-01T10:00:00.000Z";
const candidates = [
  { id: "u1", nickname: "Ana" },
  { id: "u2", nickname: "Beto" },
  { id: "u3", nickname: "Carla" },
];

const service = () =>
  composeImpostor({
    clock: new FixedClock(new Date(deadline)),
    random: new SequenceRandom([0.5]),
    verifier: createStaticVerifier({ "ana-token": { id: "u1", name: "Ana" } }),
  });

const post = (body: unknown, headers: Record<string, string> = auth) => ({
  body: JSON.stringify(body),
  headers: { ...headers, "content-type": "application/json" },
  method: "POST",
});

const choose = { candidates, deadline, hostId: "u1" };

describe("impostor internal routes", () => {
  it("chooses an impostor for a new round with 201", async () => {
    const res = await service().request(
      "/internal/ABCD/1/impostor",
      post(choose)
    );

    expect(res.status).toBe(201);
    expect(ChooseImpostorResponse.parse(await res.json()).impostorId).toBe(
      "u2"
    );
  });

  it("answers 200 with the same impostor on a repeat", async () => {
    const app = service();
    await app.request("/internal/ABCD/1/impostor", post(choose));

    const res = await app.request("/internal/ABCD/1/impostor", post(choose));

    expect(res.status).toBe(200);
    expect(ChooseImpostorResponse.parse(await res.json()).impostorId).toBe(
      "u2"
    );
  });

  it("rejects fewer than two candidates with 422", async () => {
    const res = await service().request(
      "/internal/ABCD/1/impostor",
      post({ ...choose, candidates: [candidates[0]] })
    );

    expect(res.status).toBe(422);
  });

  it("rejects repeated candidate ids with 422", async () => {
    const res = await service().request(
      "/internal/ABCD/1/impostor",
      post({ ...choose, candidates: [candidates[0], candidates[0]] })
    );

    expect(res.status).toBe(422);
  });

  it("answers a verdict with both fields null until the voting is over", async () => {
    const app = service();
    await app.request("/internal/ABCD/1/impostor", post(choose));

    const res = await app.request("/internal/ABCD/1/verdict", {
      headers: auth,
    });

    expect(res.status).toBe(200);
    expect(VerdictResponse.parse(await res.json())).toStrictEqual({
      impostorId: null,
      verdict: null,
    });
  });

  it("answers 404 round-not-found when the round has no impostor", async () => {
    const res = await service().request("/internal/ABCD/9/verdict", {
      headers: auth,
    });

    expect(res.status).toBe(404);
    await expect(res.json()).resolves.toMatchObject({
      error: { code: "round-not-found" },
    });
  });

  it("requires the token on both routes", async () => {
    const app = service();
    const forged = { authorization: "Bearer forged" };

    const chosen = await app.request(
      "/internal/ABCD/1/impostor",
      post(choose, forged)
    );
    const verdict = await app.request("/internal/ABCD/1/verdict", {
      headers: forged,
    });

    expect([chosen.status, verdict.status]).toStrictEqual([401, 401]);
  });
});
