import type { Clock } from "../domain/ports/clock.port.ts";

export const systemClock: Clock = { now: () => new Date() };
