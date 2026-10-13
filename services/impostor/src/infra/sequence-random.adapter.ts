import type { Random } from "../domain/ports/random.port.ts";

/** Returns the given numbers in order, then repeats the last one. For tests. */
export class SequenceRandom implements Random {
  readonly #values: readonly number[];
  #index = 0;

  constructor(values: readonly number[]) {
    this.#values = values;
  }

  next(): number {
    const value =
      this.#values[Math.min(this.#index, this.#values.length - 1)] ?? 0;
    this.#index += 1;
    return value;
  }
}
