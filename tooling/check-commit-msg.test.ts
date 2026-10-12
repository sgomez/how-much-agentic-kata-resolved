import { describe, expect, it } from "vitest";

import { commitMessageProblems } from "./check-commit-msg.ts";

describe("commit message check", () => {
  it.each([
    "feat(games): let players join with a code",
    "fix: keep the deck per game",
    "docs!: rename the glossary",
  ])("accepts %s", (message) => {
    expect(commitMessageProblems(message)).toStrictEqual([]);
  });

  it("rejects a message without a conventional type", () => {
    expect(commitMessageProblems("added games")).toHaveLength(1);
  });

  it("rejects a message in Spanish", () => {
    expect(commitMessageProblems("feat(games): añade la partida")).toHaveLength(
      1
    );
  });
});
