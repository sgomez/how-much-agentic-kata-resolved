import { describe, expect, it } from "vitest";

import { ListPacks } from "../src/application/list-packs.query.ts";
import { MemoryQuestionSource } from "../src/infra/memory-question-source.adapter.ts";
import { syntheticQuestion } from "./fixtures.ts";

describe(ListPacks, () => {
  it("lists each pack with its number of questions, sorted by name", async () => {
    const listPacks = new ListPacks({
      source: new MemoryQuestionSource([
        syntheticQuestion(1, { pack: "synthetic-b" }),
        syntheticQuestion(2, { pack: "synthetic-a" }),
        syntheticQuestion(3, { pack: "synthetic-b" }),
      ]),
    });

    await expect(listPacks.execute()).resolves.toStrictEqual([
      { name: "synthetic-a", questionCount: 1 },
      { name: "synthetic-b", questionCount: 2 },
    ]);
  });
});
