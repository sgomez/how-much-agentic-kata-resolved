import type { QuestionSource } from "../domain/ports/question-source.port.ts";
import type { Question } from "../domain/question.ts";

export class MemoryQuestionSource implements QuestionSource {
  readonly #questions: readonly Question[];

  constructor(questions: readonly Question[]) {
    this.#questions = questions;
  }

  all(): Promise<readonly Question[]> {
    return Promise.resolve(this.#questions);
  }
}
