import { describe, expect, it } from "vitest";

import {
  formatCompact,
  formatLimit,
  formatNumber,
  formatReadableWithUnit,
  formatSpoken,
  formatWithUnit,
  parseEsNumber,
} from "../src/lib/format.ts";

describe("Spanish (Spain) number formatting", () => {
  it("groups every thousand with a dot and uses a decimal comma", () => {
    expect(formatNumber(1_234_567.5)).toBe("1.234.567,5");
    expect(formatNumber(1234)).toBe("1.234");
  });

  it("writes negatives with a typographic minus", () => {
    expect(formatNumber(-12)).toBe("−12");
  });

  it("puts a non-breaking space between the number and its unit", () => {
    expect(formatWithUnit(45, "%")).toBe("45 %");
    expect(formatWithUnit(12, "€")).toBe("12 €");
  });

  it("leaves the plural unit out of a limit of one", () => {
    expect(formatLimit(1, "personas")).toBe("1");
    expect(formatLimit(-1, "°C")).toBe("−1");
    expect(formatLimit(100, "%")).toBe("100 %");
  });

  it("gives big numbers a readable form with the unit", () => {
    expect(formatReadableWithUnit(1_200_000, "personas")).toBe(
      "1,2 millones de personas"
    );
    expect(formatReadableWithUnit(950_000, "personas")).toBeNull();
  });

  it("reads values aloud with the unit", () => {
    expect(formatSpoken(-12, "°C")).toBe("-12 °C");
  });

  it("writes compact tick labels", () => {
    expect(formatCompact(25_000)).toBe("25 k");
    expect(formatCompact(1_000_000_000)).toBe("1.000 M");
  });
});

describe(parseEsNumber, () => {
  it.each([
    ["1.234.567,5", 1_234_567.5],
    ["1,5", 1.5],
    ["1.500", 1500],
    ["1.5", 1.5],
    ["−12", -12],
    ["hola", null],
  ])("reads %s as %s", (input, expected) => {
    expect(parseEsNumber(input)).toBe(expected);
  });
});
