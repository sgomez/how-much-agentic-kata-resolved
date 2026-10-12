import { readFile } from "node:fs/promises";

import { QuestionsFile } from "@hmk/contracts/catalog";
import { z } from "zod";

import type { QuestionSource } from "../domain/ports/question-source.port.ts";
import type { Question } from "../domain/question.ts";
import { SYNTHETIC_QUESTIONS } from "./synthetic-questions.ts";

/**
 * Reads the questions file once, on first use. A missing file falls back to the
 * synthetic sample with a warning; an invalid file is a startup error.
 */
export class FileQuestionSource implements QuestionSource {
  readonly #path: string;
  #questions: Promise<readonly Question[]> | undefined;

  constructor(path: string) {
    this.#path = path;
  }

  all(): Promise<readonly Question[]> {
    this.#questions ??= this.#load();
    return this.#questions;
  }

  async #load(): Promise<readonly Question[]> {
    let raw: string;
    try {
      raw = await readFile(this.#path, "utf-8");
    } catch {
      console.warn(
        `[catalog] ${this.#path} not found: serving the synthetic sample. Download the questions file from the facilitator into data/.`
      );
      return SYNTHETIC_QUESTIONS;
    }
    const parsed = QuestionsFile.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      throw new Error(
        `${this.#path} is not a valid questions file:\n${z.prettifyError(parsed.error)}`
      );
    }
    return parsed.data;
  }
}
