import type { Clock } from "../domain/ports/clock.port.ts";

/** Always tells the same time, unless moved. For tests. */
export class FixedClock implements Clock {
  #now: Date;

  constructor(now: Date) {
    this.#now = now;
  }

  now(): Date {
    return this.#now;
  }

  set(now: Date): void {
    this.#now = now;
  }
}
