import { UnknownCodeError } from "../domain/game.errors.ts";
import type { GameRepository } from "../domain/game.repository.ts";
import type { RoundsPort } from "../domain/ports/rounds.port.ts";

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
    const game = await this.#games.get(code.toUpperCase());
    if (game === undefined) {
      throw new UnknownCodeError(code);
    }
    game.assertCanStart(playerId);
    await this.#rounds.createRound(game.code, 1, {
      hostId: game.host.id,
      impostorMode: game.settings.impostorMode,
      // Rounds takes `packs` only when the host picked some.
      ...(game.settings.packs.length === 0
        ? {}
        : { packs: [...game.settings.packs] }),
      players: game.players.map(({ id, nickname }) => ({ id, nickname })),
      roundSeconds: game.settings.roundSeconds,
    });
    game.start(playerId);
    await this.#games.save(game);
  }
}
