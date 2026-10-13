import type { Game } from "./game.aggregate.ts";
import { UnknownCodeError } from "./game.errors.ts";
import type { GameRepository } from "./game.repository.ts";

/**
 * The game with this code.
 * @param code in any case
 * @throws {UnknownCodeError} when no game has the code.
 */
export const findGame = async (
  games: GameRepository,
  code: string
): Promise<Game> => {
  const game = await games.get(code.toUpperCase());
  if (game === undefined) {
    throw new UnknownCodeError(code);
  }
  return game;
};
