import { defineConfig } from "vitest/config";

/** Run with `pnpm acceptance` while `pnpm dev` is running. Not part of `pnpm test`. */
export default defineConfig({
  test: {
    name: "acceptance",
    globalSetup: ["./global-setup.ts"],
    root: import.meta.dirname,
    include: ["cases/**/*.test.ts"],
    // Games share one running system (and the catalog's rigged-question queue): one file at a time.
    fileParallelism: false,
    sequence: { concurrent: false },
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
});
