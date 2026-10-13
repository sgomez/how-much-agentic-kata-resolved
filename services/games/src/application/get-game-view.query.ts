import type { GameView } from "@hmk/contracts/games";

import { findGame } from "../domain/find-game.ts";
import type { GameRepository } from "../domain/game.repository.ts";

/** What every phone shows of a game: the same for everyone. */
export class GetGameView {
  readonly #games: GameRepository;

  constructor(deps: { games: GameRepository }) {
    this.#games = deps.games;
  }

  /** @param code in any case */
  async execute(code: string): Promise<GameView> {
    const game = await findGame(this.#games, code);
    return {
      code: game.code,
      currentRound: game.currentRound,
      hostId: game.host.id,
      phase: game.phase,
      players: [...game.players],
      settings: {
        impostorMode: game.settings.impostorMode,
        packs: [...game.settings.packs],
        roundSeconds: game.settings.roundSeconds,
        rounds: game.settings.rounds,
      },
    };
  }
}
