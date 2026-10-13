import { Game } from "../domain/game.aggregate.ts";
import type { Player, Settings } from "../domain/game.aggregate.ts";
import type { GameRepository } from "../domain/game.repository.ts";
import type { CodeGenerator } from "../domain/ports/code-generator.port.ts";

export interface CreateGameInput {
  host: Player;
  settings: Settings;
}

/** Creates a game in the lobby, with the host as its only player. */
export class CreateGame {
  readonly #games: GameRepository;
  readonly #codes: CodeGenerator;

  constructor(deps: { games: GameRepository; codes: CodeGenerator }) {
    this.#games = deps.games;
    this.#codes = deps.codes;
  }

  /** @returns the code of the new game */
  async execute({ host, settings }: CreateGameInput): Promise<string> {
    const code = await this.#unusedCode();
    await this.#games.save(Game.create(code, host, settings));
    return code;
  }

  async #unusedCode(): Promise<string> {
    for (;;) {
      const code = this.#codes.next();
      // oxlint-disable-next-line no-await-in-loop -- each attempt depends on the last answer.
      if ((await this.#games.get(code)) === undefined) {
        return code;
      }
    }
  }
}
