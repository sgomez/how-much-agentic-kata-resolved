import type { Question } from "../question.ts";

/** Where the catalog's questions come from. */
export interface QuestionSource {
  all: () => Promise<readonly Question[]>;
}
