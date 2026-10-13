import type { Player } from "../domain/game.aggregate.ts";
import { UnknownCodeError } from "../domain/game.errors.ts";
import type { GameRepository } from "../domain/game.repository.ts";

/** Puts a player in the lobby of a game; joining again changes nothing. */
export class JoinGame {
  readonly #games: GameRepository;

  constructor(deps: { games: GameRepository }) {
    this.#games = deps.games;
  }

  /** @param code in any case */
  async execute({
    code,
    player,
  }: {
    code: string;
    player: Player;
  }): Promise<void> {
    const game = await this.#games.get(code.toUpperCase());
    if (game === undefined) {
      throw new UnknownCodeError(code);
    }
    game.join(player);
    await this.#games.save(game);
  }
}
