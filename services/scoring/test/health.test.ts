import { createStaticVerifier } from "@hmk/auth";
import { describe, expect, it } from "vitest";

import { composeScoring } from "../src/composition.ts";
import { MemoryRoundsAdapter } from "../src/infra/memory-rounds.adapter.ts";

describe("scoring service", () => {
  it("answers /health", async () => {
    const app = composeScoring({
      rounds: new MemoryRoundsAdapter(),
      verifier: createStaticVerifier({}),
    });

    const res = await app.request("/health");

    await expect(res.json()).resolves.toStrictEqual({
      service: "scoring",
      status: "ok",
    });
  });
});
