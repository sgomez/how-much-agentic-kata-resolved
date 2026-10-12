import type { Question } from "../src/domain/question.ts";

export const syntheticQuestion = (
  n: number,
  overrides: Partial<Question> = {}
): Question => ({
  id: `q${n}`,
  text: `Synthetic question ${n}`,
  unit: "units",
  solution: n,
  pack: "synthetic-a",
  min: 0,
  max: 100,
  ...overrides,
});
