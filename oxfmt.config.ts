import { defineConfig } from "oxfmt";
import ultracite from "ultracite/oxfmt";

export default defineConfig({
  ...ultracite,
  // Vendored agent skills: kept byte-identical to their source (skills-lock.json).
  ignorePatterns: [
    ...(ultracite.ignorePatterns ?? []),
    ".agents/**",
    "skills-lock.json",
    // Generated from packages/ui/design/tokens.json; a test keeps them in sync.
    "packages/ui/src/styles/tokens.css",
  ],
});
