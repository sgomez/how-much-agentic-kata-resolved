import type { CodeGenerator } from "../domain/ports/code-generator.port.ts";

/** Upper-case letters without I and O, which look like 1 and 0. */
const LETTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const CODE_LENGTH = 4;

export const randomCodeGenerator: CodeGenerator = {
  next: () =>
    Array.from(
      { length: CODE_LENGTH },
      () => LETTERS[Math.floor(Math.random() * LETTERS.length)]
    ).join(""),
};
