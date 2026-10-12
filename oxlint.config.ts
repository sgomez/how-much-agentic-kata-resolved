import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";
import react from "ultracite/oxlint/react";
import vitest from "ultracite/oxlint/vitest";

export default defineConfig({
  extends: [core, react, vitest],
  ignorePatterns: [...core.ignorePatterns, "**/dist-types"],
  rules: {
    // `export const X = z.object(...)` + `export type X = z.infer<typeof X>` is the Zod idiom.
    "no-redeclare": "off",
    // Key order carries meaning here (contracts list fields in domain order).
    "sort-keys": "off",
  },
  overrides: [
    {
      // A service's errors live together in `domain/<name>.errors.ts`.
      files: ["**/*.errors.ts"],
      rules: { "max-classes-per-file": "off" },
    },
    {
      // The design system builds custom ARIA widgets (the ruler's slider, Stepper's spinbutton,
      // SegmentedControl's radios, Countdown's progressbar) and live regions on styled elements;
      // the native tags this rule suggests cannot take that look or behaviour.
      files: ["packages/ui/src/components/**"],
      rules: { "jsx-a11y/prefer-tag-over-role": "off" },
    },
    {
      // Contract stubs each group fills in during the kata.
      files: ["packages/contracts/src/{games,rounds,scoring,impostor}/http.ts"],
      rules: { "unicorn/no-empty-file": "off" },
    },
  ],
});
