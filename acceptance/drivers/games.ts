import { CreateGameResponse, GameView } from "@hmk/contracts/games";
import type { CreateGameRequest, NextRoundRequest } from "@hmk/contracts/games";
import { z } from "zod";

import type { GamesDriver } from "../dsl/drivers.ts";

export const gamesDriver: GamesDriver = {
  createGame: (host, { impostor, roundSeconds }) => {
    const request: CreateGameRequest = { impostorMode: impostor, roundSeconds };
    return host.http.post("/games", request, CreateGameResponse);
  },
  join: async (player, code) => {
    const { status } = await player.http.request(
      "POST",
      `/games/${code}/players`
    );
    if (status === 404) {
      return "unknown-code";
    }
    if (status < 200 || status >= 300) {
      throw new Error(`Joining game ${code} answered ${status}`);
    }
    return "joined";
  },
  lobby: async (player, code) => {
    const view = await player.http.get(`/games/${code}`, GameView);
    return view.players.map((p) => p.nickname);
  },
  nextRound: async (host, code) => {
    const { currentRound } = await host.http.get(`/games/${code}`, GameView);
    if (currentRound === null) {
      throw new Error(`Game ${code} has no current round to move on from`);
    }
    const request: NextRoundRequest = { round: currentRound };
    await host.http.post(`/games/${code}/next`, request, z.unknown());
  },
  startGame: async (host, code) => {
    await host.http.post(`/games/${code}/start`, undefined, z.unknown());
  },
};
