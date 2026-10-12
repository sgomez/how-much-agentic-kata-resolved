import { describe, expect, it } from "vitest";

import { newPlayer, packsSeenBy } from "../dsl/index.ts";

describe("catalog", () => {
  it("a signed-in player can see the question packs", async () => {
    const ana = await newPlayer("ana");

    const packs = await packsSeenBy(ana);
    expect(packs).not.toHaveLength(0);
  });
});
