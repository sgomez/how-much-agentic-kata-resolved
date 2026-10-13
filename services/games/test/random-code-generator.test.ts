import { describe, expect, it } from "vitest";

import { randomCodeGenerator } from "../src/infra/random-code-generator.adapter.ts";

describe("random code generator", () => {
  it("makes codes of four upper-case letters, never I or O", () => {
    const codes = Array.from({ length: 500 }, () => randomCodeGenerator.next());

    for (const code of codes) {
      expect(code).toMatch(/^[A-HJ-NP-Z]{4}$/u);
    }
  });
});
