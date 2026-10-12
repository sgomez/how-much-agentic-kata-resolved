import { createStaticVerifier } from "@hmk/auth";
import { describe, expect, it } from "vitest";

import { composeScoring } from "../src/composition.ts";

describe("scoring service", () => {
  it("answers /health", async () => {
    const app = composeScoring({ verifier: createStaticVerifier({}) });

    const res = await app.request("/health");

    await expect(res.json()).resolves.toStrictEqual({
      service: "scoring",
      status: "ok",
    });
  });
});
