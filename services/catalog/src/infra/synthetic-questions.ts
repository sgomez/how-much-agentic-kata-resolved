import type { Question } from "../domain/question.ts";

/**
 * Clearly fake questions, used when no questions file is present and in tests.
 * Real content is distributed by the facilitator (ADR-0005).
 */
export const SYNTHETIC_QUESTIONS: readonly Question[] = Array.from(
  { length: 12 },
  (_, i) => {
    const n = i + 1;
    return {
      id: `synthetic-${n}`,
      text: `Synthetic question ${n}`,
      unit: "units",
      solution: n * 10,
      pack: n <= 6 ? "synthetic-a" : "synthetic-b",
      min: 0,
      max: 1000,
    };
  }
);
