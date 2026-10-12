import type { GamesDriver } from "../dsl/drivers.ts";
import { pendingIn } from "../dsl/pending-contract.ts";

const pending = pendingIn("games", "acceptance/drivers/games.ts");

// Owned by the games group: replace each `pending(...)` with calls through `player.http`.
export const gamesDriver: GamesDriver = {
  createGame: () => pending("GamesDriver.createGame"),
  join: () => pending("GamesDriver.join"),
  lobby: () => pending("GamesDriver.lobby"),
  nextRound: () => pending("GamesDriver.nextRound"),
  startGame: () => pending("GamesDriver.startGame"),
};
