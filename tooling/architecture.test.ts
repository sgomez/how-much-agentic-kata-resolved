import path from "node:path";

import { cruise } from "dependency-cruiser";
import type { IViolation } from "dependency-cruiser";
import extractDepcruiseOptions from "dependency-cruiser/config-utl/extract-depcruise-options";
import { describe, expect, it } from "vitest";

const ROOT = `${path.resolve(import.meta.dirname, "..")}/`;
const CRUISED = ["packages", "services", "apps", "acceptance"];
const CRUISE_TIMEOUT_MS = 60_000;

const describeViolation =
  (fixes: Map<string, string>) =>
  (violation: IViolation): string =>
    `${violation.rule.name}: ${violation.from} -> ${violation.to}\n  How to fix: ${fixes.get(violation.rule.name) ?? "see .dependency-cruiser.cjs"}`;

describe("architecture (.dependency-cruiser.cjs, ADR-0002)", () => {
  it(
    "has no dependency violations",
    async () => {
      const options = await extractDepcruiseOptions(
        `${ROOT}.dependency-cruiser.cjs`
      );
      const result = await cruise(CRUISED, {
        ...options,
        baseDir: ROOT,
        validate: true,
      });
      const violations =
        typeof result.output === "string"
          ? []
          : result.output.summary.violations;
      const fixes = new Map(
        (options.ruleSet?.forbidden ?? []).map((rule) => [
          rule.name ?? "",
          rule.comment ?? "",
        ])
      );

      expect(violations.map(describeViolation(fixes))).toStrictEqual([]);
    },
    CRUISE_TIMEOUT_MS
  );
});
