import type { Random } from "../domain/ports/random.port.ts";

export const mathRandom: Random = { next: () => Math.random() };
