import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

import * as ui from "../src/index.ts";

const components = Object.keys(ui).filter((name) => /^[A-Z]/u.test(name));

describe("COMPONENTS.md", () => {
  it.each(components)("documents %s", async (name) => {
    const index = await readFile(
      new URL("../COMPONENTS.md", import.meta.url),
      "utf-8"
    );

    expect(index).toContain(`- **${name}**:`);
  });
});
