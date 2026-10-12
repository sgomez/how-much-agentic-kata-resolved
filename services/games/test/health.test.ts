import { createStaticVerifier } from "@hmk/auth";
import { describe, expect, it } from "vitest";

import { composeGames } from "../src/composition.ts";

describe("games service", () => {
  it("answers /health", async () => {
    const app = composeGames({ verifier: createStaticVerifier({}) });

    const res = await app.request("/health");

    await expect(res.json()).resolves.toStrictEqual({
      service: "games",
      status: "ok",
    });
  });
});
