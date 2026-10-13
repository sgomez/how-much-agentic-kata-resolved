import type { ClockPort } from "../domain/ports/clock.port.ts";

export class SystemClock implements ClockPort {
  // oxlint-disable-next-line class-methods-use-this
  now(): Date {
    return new Date();
  }
}
