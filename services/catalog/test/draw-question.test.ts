import { describe, expect, it } from "vitest";

import { DrawQuestion } from "../src/application/draw-question.use-case.ts";
import {
  DeckExhaustedError,
  NoQuestionsInPacksError,
} from "../src/domain/deck.errors.ts";
import { MemoryDeckRepository } from "../src/infra/memory-deck-repository.adapter.ts";
import { MemoryQuestionSource } from "../src/infra/memory-question-source.adapter.ts";
import { SequenceRandom } from "../src/infra/sequence-random.adapter.ts";
import { syntheticQuestion } from "./fixtures.ts";

const drawQuestionWith = (
  questions = [
    syntheticQuestion(1),
    syntheticQuestion(2),
    syntheticQuestion(3),
  ],
  rolls = [0]
) =>
  new DrawQuestion({
    decks: new MemoryDeckRepository(),
    random: new SequenceRandom(rolls),
    source: new MemoryQuestionSource(questions),
  });

describe(DrawQuestion, () => {
  it("draws a question picked by the random roll", async () => {
    const drawQuestion = drawQuestionWith(undefined, [0.99]);

    const question = await drawQuestion.execute({ gameId: "g1" });

    expect(question.id).toBe("q3");
  });

  it("never repeats a question within the same game", async () => {
    const drawQuestion = drawQuestionWith();

    const drawn = [
      await drawQuestion.execute({ gameId: "g1" }),
      await drawQuestion.execute({ gameId: "g1" }),
      await drawQuestion.execute({ gameId: "g1" }),
    ];

    expect(new Set(drawn.map((q) => q.id))).toStrictEqual(
      new Set(["q1", "q2", "q3"])
    );
  });

  it("lets different games draw the same question", async () => {
    const drawQuestion = drawQuestionWith();

    const first = await drawQuestion.execute({ gameId: "g1" });
    const second = await drawQuestion.execute({ gameId: "g2" });

    expect(second).toStrictEqual(first);
  });

  it("fails when the game has drawn every question", async () => {
    const drawQuestion = drawQuestionWith([syntheticQuestion(1)]);
    await drawQuestion.execute({ gameId: "g1" });

    await expect(drawQuestion.execute({ gameId: "g1" })).rejects.toBeInstanceOf(
      DeckExhaustedError
    );
  });

  it("only draws from the enabled packs", async () => {
    const drawQuestion = drawQuestionWith([
      syntheticQuestion(1, { pack: "synthetic-a" }),
      syntheticQuestion(2, { pack: "synthetic-b" }),
    ]);

    const question = await drawQuestion.execute({
      gameId: "g1",
      packs: ["synthetic-b"],
    });

    expect(question.id).toBe("q2");
  });

  it("rejects packs that have no questions", async () => {
    const drawQuestion = drawQuestionWith();

    await expect(
      drawQuestion.execute({ gameId: "g1", packs: ["unknown"] })
    ).rejects.toBeInstanceOf(NoQuestionsInPacksError);
  });
});
