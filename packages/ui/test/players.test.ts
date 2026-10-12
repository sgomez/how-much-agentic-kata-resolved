import { describe, expect, it } from "vitest";

import {
  competitionRanks,
  initials,
  playerColorIndex,
  withDistinctNames,
} from "../src/lib/players.ts";

describe("players", () => {
  it("gives every id a stable colour from 1 to 12", () => {
    const index = playerColorIndex("p-1");
    expect(index).toBe(playerColorIndex("p-1"));
    expect(index).toBeGreaterThanOrEqual(1);
    expect(index).toBeLessThanOrEqual(12);
  });

  it("takes initials from one or two words", () => {
    expect(initials("Ana Gil")).toBe("AG");
    expect(initials("lu")).toBe("LU");
    expect(initials("  ")).toBe("?");
  });

  it("numbers repeated nicknames in join order", () => {
    const names = withDistinctNames([
      { name: "Ana" },
      { name: "Bea" },
      { name: "ana" },
    ]).map((player) => player.name);
    expect(names).toStrictEqual(["Ana", "Bea", "ana 2"]);
  });

  it("lets ties share a position", () => {
    expect(competitionRanks([9, 7, 7, 3])).toStrictEqual([1, 2, 2, 4]);
  });
});
