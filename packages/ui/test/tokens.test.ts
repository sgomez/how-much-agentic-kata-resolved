import { describe, expect, it } from "vitest";

import {
  readTokens,
  readTokensCss,
  renderTokensCss,
} from "../scripts/tokens-to-css.ts";

describe("tokens.css", () => {
  it("is what design/tokens.json generates (run `pnpm --filter @hmk/ui tokens`)", () => {
    expect(readTokensCss()).toBe(renderTokensCss(readTokens()));
  });
});
