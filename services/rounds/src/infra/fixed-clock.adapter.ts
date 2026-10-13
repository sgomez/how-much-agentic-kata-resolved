import type { ClockPort } from "../domain/ports/clock.port.ts";

export class FixedClock implements ClockPort {
  #now: Date;

  constructor(now: Date = new Date("2026-01-01T00:00:00.000Z")) {
    this.#now = now;
  }

  now(): Date {
    return this.#now;
  }

  advance(ms: number): void {
    this.#now = new Date(this.#now.getTime() + ms);
  }

  set(now: Date): void {
    this.#now = now;
  }
}
