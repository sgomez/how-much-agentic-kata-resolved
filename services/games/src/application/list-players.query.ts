import type { ListPlayersResponse } from "@hmk/contracts/games";

import { UnknownCodeError } from "../domain/game.errors.ts";
import type { GameRepository } from "../domain/game.repository.ts";

/** Every player of a game in joining order, for the services that score it. */
export class ListPlayers {
  readonly #games: GameRepository;

  constructor(deps: { games: GameRepository }) {
    this.#games = deps.games;
  }

  /** @param code in any case */
  async execute(code: string): Promise<ListPlayersResponse> {
    const game = await this.#games.get(code.toUpperCase());
    if (game === undefined) {
      throw new UnknownCodeError(code);
    }
    return {
      impostorMode: game.settings.impostorMode,
      players: game.players.map(({ id, nickname }) => ({ id, nickname })),
    };
  }
}
