import { z } from "zod";

/** A question as stored in the questions file and served by the catalog. */
export const Question = z
  .object({
    id: z.string().min(1),
    text: z.string().min(1),
    unit: z.string().min(1),
    solution: z.number(),
    pack: z.string().min(1),
    /** Lower bound of the estimate ruler. */
    min: z.number(),
    /** Upper bound of the estimate ruler. */
    max: z.number(),
  })
  .refine((q) => q.min < q.max, {
    message: "min must be lower than max",
    path: ["min"],
  })
  .refine((q) => q.solution >= q.min && q.solution <= q.max, {
    message: "solution must be inside the [min, max] range",
    path: ["solution"],
  });
export type Question = z.infer<typeof Question>;

/** The questions file the facilitator distributes (`data/questions.json`). */
export const QuestionsFile = z
  .array(Question)
  .min(1)
  .refine(
    (questions) =>
      new Set(questions.map((q) => q.id)).size === questions.length,
    {
      message: "question ids must be unique",
    }
  );
export type QuestionsFile = z.infer<typeof QuestionsFile>;

/** GET /packs */
export const ListPacksResponse = z.object({
  packs: z.array(
    z.object({
      name: z.string(),
      questionCount: z.number().int().nonnegative(),
    })
  ),
});
export type ListPacksResponse = z.infer<typeof ListPacksResponse>;

/** POST /decks/:gameId/draws */
export const DrawQuestionRequest = z.object({
  /** Packs to draw from. Omit it to draw from every pack. */
  packs: z.array(z.string().min(1)).min(1).optional(),
});
export type DrawQuestionRequest = z.infer<typeof DrawQuestionRequest>;

export const DrawQuestionResponse = z.object({
  question: Question,
});
export type DrawQuestionResponse = z.infer<typeof DrawQuestionResponse>;

/**
 * POST /test/next-question (only when the catalog runs with HMK_TEST_MODE=1).
 * The next draw, for any game, returns exactly this question. Rigging again
 * before that draw replaces it.
 */
export const ForceNextQuestionRequest = Question;
export type ForceNextQuestionRequest = z.infer<typeof ForceNextQuestionRequest>;
