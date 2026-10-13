import type { CodeGenerator } from "../domain/ports/code-generator.port.ts";

/** Returns the given codes in order, then repeats the last one. For tests. */
export class FixedCodeGenerator implements CodeGenerator {
  readonly #codes: readonly string[];
  #index = 0;

  constructor(codes: readonly string[]) {
    this.#codes = codes;
  }

  next(): string {
    const code = this.#codes[Math.min(this.#index, this.#codes.length - 1)];
    this.#index += 1;
    return code ?? "AAAA";
  }
}
