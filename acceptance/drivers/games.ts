import { CreateGameResponse, GameView } from "@hmk/contracts/games";
import type { CreateGameRequest } from "@hmk/contracts/games";

import type { GamesDriver } from "../dsl/drivers.ts";
import { pendingIn } from "../dsl/pending-contract.ts";

const pending = pendingIn("games", "acceptance/drivers/games.ts");

// Owned by the games group: replace each `pending(...)` with calls through `player.http`.
export const gamesDriver: GamesDriver = {
  createGame: (host, { impostor, roundSeconds }) => {
    const request: CreateGameRequest = { impostorMode: impostor, roundSeconds };
    return host.http.post("/games", request, CreateGameResponse);
  },
  join: () => pending("GamesDriver.join"),
  lobby: async (player, code) => {
    const view = await player.http.get(`/games/${code}`, GameView);
    return view.players.map((p) => p.nickname);
  },
  nextRound: () => pending("GamesDriver.nextRound"),
  startGame: () => pending("GamesDriver.startGame"),
};
