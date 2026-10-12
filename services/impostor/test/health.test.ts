import { createStaticVerifier } from "@hmk/auth";
import { describe, expect, it } from "vitest";

import { composeImpostor } from "../src/composition.ts";

describe("impostor service", () => {
  it("answers /health", async () => {
    const app = composeImpostor({ verifier: createStaticVerifier({}) });

    const res = await app.request("/health");

    await expect(res.json()).resolves.toStrictEqual({
      service: "impostor",
      status: "ok",
    });
  });
});
