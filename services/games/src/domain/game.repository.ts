import type { Game } from "./game.aggregate.ts";

export interface GameRepository {
  /** `code` is already upper-cased. */
  get: (code: string) => Promise<Game | undefined>;
  save: (game: Game) => Promise<void>;
}
