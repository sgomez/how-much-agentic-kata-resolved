import type { Question } from "./question.ts";

export interface PackSummary {
  name: string;
  questionCount: number;
}

/** The packs present in a set of questions, sorted by name. */
export const summarizePacks = (
  questions: readonly Question[]
): PackSummary[] => {
  const counts = new Map<string, number>();
  for (const question of questions) {
    counts.set(question.pack, (counts.get(question.pack) ?? 0) + 1);
  }
  return [...counts]
    .map(([name, questionCount]) => ({ name, questionCount }))
    .toSorted((a, b) => a.name.localeCompare(b.name));
};

/** The questions that belong to the enabled packs; every question when `packs` is undefined. */
export const inPacks = (
  questions: readonly Question[],
  packs: readonly string[] | undefined
): Question[] => {
  if (packs === undefined) {
    return [...questions];
  }
  const enabled = new Set(packs);
  return questions.filter((question) => enabled.has(question.pack));
};
