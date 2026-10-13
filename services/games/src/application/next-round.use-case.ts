import {
  DeckExhaustedError,
  RoundNotRevealedError,
  UnknownCodeError,
  VotingNotOverError,
} from "../domain/game.errors.ts";
import type { GameRepository } from "../domain/game.repository.ts";
import type { ImpostorPort } from "../domain/ports/impostor.port.ts";
import type { RoundsPort } from "../domain/ports/rounds.port.ts";
import { roundRequest } from "./round-request.ts";

export interface NextRoundInput {
  /** In any case. */
  code: string;
  /** The id of the player asking, from the token. */
  playerId: string;
  /** The round the host is moving on from. */
  round: number;
}

/**
 * The host moves the game on from a round once it is revealed (and, in
 * impostor mode, once its voting is over): to the next round once rounds has
 * created it, or to the end of the game after the last round or when no
 * question is left. Asking again for a round the game left changes nothing.
 */
export class NextRound {
  readonly #games: GameRepository;
  readonly #rounds: RoundsPort;
  readonly #impostor: ImpostorPort;

  constructor(deps: {
    games: GameRepository;
    rounds: RoundsPort;
    impostor: ImpostorPort;
  }) {
    this.#games = deps.games;
    this.#rounds = deps.rounds;
    this.#impostor = deps.impostor;
  }

  async execute({ code, playerId, round }: NextRoundInput): Promise<void> {
    const game = await this.#games.get(code.toUpperCase());
    if (game === undefined) {
      throw new UnknownCodeError(code);
    }
    if (!game.canLeave(playerId, round)) {
      return;
    }
    const { solution } = await this.#rounds.getRound(game.code, round);
    if (solution === null) {
      throw new RoundNotRevealedError(round);
    }
    if (game.settings.impostorMode) {
      const verdict = await this.#impostor.verdict(game.code, round);
      if (verdict === null) {
        throw new VotingNotOverError(round);
      }
    }
    if (game.isLastRound(round)) {
      game.finishAfter(round);
    } else {
      try {
        await this.#rounds.createRound(
          game.code,
          round + 1,
          roundRequest(game)
        );
        game.moveOnFrom(round);
      } catch (error) {
        if (!(error instanceof DeckExhaustedError)) {
          throw error;
        }
        game.finishAfter(round);
      }
    }
    await this.#games.save(game);
  }
}
