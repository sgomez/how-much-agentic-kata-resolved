import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import nodePath from "node:path";

import { describe, expect, it, vi } from "vitest";

import { FileQuestionSource } from "../src/infra/file-question-source.adapter.ts";
import { SYNTHETIC_QUESTIONS } from "../src/infra/synthetic-questions.ts";
import { syntheticQuestion } from "./fixtures.ts";

const fileWith = async (content: string): Promise<string> => {
  const path = nodePath.join(
    await mkdtemp(nodePath.join(tmpdir(), "hmk-catalog-")),
    "questions.json"
  );
  await writeFile(path, content);
  return path;
};

describe(FileQuestionSource, () => {
  it("reads the questions from the file", async () => {
    const path = await fileWith(JSON.stringify([syntheticQuestion(1)]));

    await expect(new FileQuestionSource(path).all()).resolves.toStrictEqual([
      syntheticQuestion(1),
    ]);
  });

  it("falls back to the synthetic sample with a warning when the file is missing", async () => {
    const warn = vi.spyOn(console, "warn").mockReturnValue();

    const questions = await new FileQuestionSource(
      "/does/not/exist.json"
    ).all();

    expect(questions).toBe(SYNTHETIC_QUESTIONS);
    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });

  it("rejects a file that breaks the schema", async () => {
    const path = await fileWith(
      JSON.stringify([syntheticQuestion(1, { max: 10, min: 50 })])
    );

    await expect(new FileQuestionSource(path).all()).rejects.toThrow(
      /not a valid questions file/u
    );
  });
});
