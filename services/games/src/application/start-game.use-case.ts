import { findGame } from "../domain/find-game.ts";
import type { GameRepository } from "../domain/game.repository.ts";
import type { RoundsPort } from "../domain/ports/rounds.port.ts";
import { roundRequest } from "../domain/round-request.ts";

export interface StartGameInput {
  /** In any case. */
  code: string;
  /** The id of the player asking, from the token. */
  playerId: string;
}

/** The host starts the game: it moves on only once rounds has created round 1. */
export class StartGame {
  readonly #games: GameRepository;
  readonly #rounds: RoundsPort;

  constructor(deps: { games: GameRepository; rounds: RoundsPort }) {
    this.#games = deps.games;
    this.#rounds = deps.rounds;
  }

  async execute({ code, playerId }: StartGameInput): Promise<void> {
    const game = await findGame(this.#games, code);
    game.assertCanStart(playerId);
    await this.#rounds.createRound(game.code, 1, roundRequest(game));
    game.start(playerId);
    await this.#games.save(game);
  }
}
