import { createStaticVerifier } from "@hmk/auth";
import { describe, expect, it } from "vitest";

import { composeRounds } from "../src/composition.ts";
import { MemoryCatalog } from "../src/infra/memory-catalog.adapter.ts";
import { MemoryImpostorAdapter } from "../src/infra/memory-impostor.adapter.ts";

describe("rounds service", () => {
  it("answers /health", async () => {
    const app = composeRounds({
      catalog: new MemoryCatalog([]),
      impostor: new MemoryImpostorAdapter(),
      verifier: createStaticVerifier({}),
    });

    const res = await app.request("/health");

    await expect(res.json()).resolves.toStrictEqual({
      service: "rounds",
      status: "ok",
    });
  });
});
