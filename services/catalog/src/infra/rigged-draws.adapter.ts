import type {
  DrawQuestion,
  DrawQuestionInput,
} from "../application/draw-question.use-case.ts";
import type { Question } from "../domain/question.ts";

/**
 * Test mode only (HMK_TEST_MODE=1). Wraps DrawQuestion so the acceptance tests
 * can decide the next question: a rigged question is returned by the next
 * draw, for any game, instead of a random one. Rigging again replaces it, so a
 * test that fails before drawing never leaks its question into the next test.
 */
export class RiggedDraws {
  readonly #inner: Pick<DrawQuestion, "execute">;
  #next: Question | undefined;

  constructor(inner: Pick<DrawQuestion, "execute">) {
    this.#inner = inner;
  }

  rig(question: Question): void {
    this.#next = question;
  }

  execute(input: DrawQuestionInput): Promise<Question> {
    const rigged = this.#next;
    this.#next = undefined;
    return rigged === undefined
      ? this.#inner.execute(input)
      : Promise.resolve(rigged);
  }
}
