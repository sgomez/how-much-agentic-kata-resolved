import { createStaticVerifier } from "@hmk/auth";
import { describe, expect, it } from "vitest";

import { composeGames } from "../src/composition.ts";
import { FixedCodeGenerator } from "../src/infra/fixed-code-generator.adapter.ts";
import { MemoryRounds } from "../src/infra/memory-rounds.adapter.ts";

describe("games service", () => {
  it("answers /health", async () => {
    const app = composeGames({
      codes: new FixedCodeGenerator(["KQZT"]),
      rounds: new MemoryRounds(),
      verifier: createStaticVerifier({}),
    });

    const res = await app.request("/health");

    await expect(res.json()).resolves.toStrictEqual({
      service: "games",
      status: "ok",
    });
  });
});
