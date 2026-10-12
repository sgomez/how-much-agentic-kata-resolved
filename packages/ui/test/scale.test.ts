import { describe, expect, it } from "vitest";

import { chooseScale, createScale } from "../src/lib/scale.ts";

describe(chooseScale, () => {
  it.each([
    [0, 100, "linear"],
    [0, 8848, "linear"],
    [-90, 60, "linear"],
    [0, 50_000, "log"],
    [1, 1_000_000_000, "log"],
  ] as const)("%s to %s is %s", (min, max, kind) => {
    expect(chooseScale(min, max)).toBe(kind);
  });
});

describe("linear scale", () => {
  const scale = createScale({ min: -90, max: 60, step: 0.5, kind: "linear" });

  it("maps the ends of the range to 0 and 1", () => {
    expect(scale.toT(-90)).toBe(0);
    expect(scale.toT(60)).toBe(1);
  });

  it("snaps negatives and decimals to the step", () => {
    expect(scale.snap(-12.3)).toBe(-12.5);
    expect(scale.snap(100)).toBe(60);
  });
});

describe("log scale", () => {
  const scale = createScale({ min: 1, max: 1_000_000_000, kind: "log" });

  it("round-trips a value through its position", () => {
    expect(scale.fromT(scale.toT(12_000))).toBeCloseTo(12_000, 6);
  });

  it("keeps small and huge values reachable", () => {
    expect(scale.toT(12)).toBeGreaterThan(0.1);
    expect(scale.toT(12_000_000)).toBeLessThan(0.85);
  });

  it("snaps to two significant digits", () => {
    expect(scale.snap(12_345_678)).toBe(12_000_000);
  });

  it("works when the range starts at 0", () => {
    const fromZero = createScale({ min: 0, max: 1_000_000, kind: "log" });
    expect(fromZero.toT(0)).toBe(0);
    expect(fromZero.fromT(1)).toBeCloseTo(1_000_000, 3);
  });
});
