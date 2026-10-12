import { describe, expect, it } from "vitest";

import { routes as games } from "../src/features/games/routes.tsx";
import { routes as impostor } from "../src/features/impostor/routes.tsx";
import { routes as rounds } from "../src/features/rounds/routes.tsx";
import { routes as scoring } from "../src/features/scoring/routes.tsx";

describe("feature routes", () => {
  it("never claim the same path twice", () => {
    const paths = [...games, ...rounds, ...scoring, ...impostor].map(
      (route) => route.path
    );

    expect(new Set(paths).size).toBe(paths.length);
  });
});
