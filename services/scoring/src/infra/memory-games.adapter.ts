import type { GameInfo, GamesPort } from "../domain/ports/games.port.ts";
import { UnknownCode } from "../domain/scoring.errors.ts";

export class MemoryGamesAdapter implements GamesPort {
  private readonly games = new Map<string, GameInfo>();

  setGame(code: string, info: GameInfo): void {
    this.games.set(code.toUpperCase(), info);
  }

  getGame(code: string): Promise<GameInfo> {
    const game = this.games.get(code.toUpperCase());
    if (!game) {
      throw new UnknownCode(code);
    }
    return Promise.resolve(game);
  }
}
