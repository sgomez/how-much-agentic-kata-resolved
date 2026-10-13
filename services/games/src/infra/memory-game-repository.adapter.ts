import type { Game } from "../domain/game.aggregate.ts";
import type { GameRepository } from "../domain/game.repository.ts";

export class MemoryGameRepository implements GameRepository {
  readonly #games = new Map<string, Game>();

  get(code: string): Promise<Game | undefined> {
    return Promise.resolve(this.#games.get(code));
  }

  save(game: Game): Promise<void> {
    this.#games.set(game.code, game);
    return Promise.resolve();
  }
}
