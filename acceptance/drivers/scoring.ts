import { GameView } from "@hmk/contracts/games";
import {
  ScoreboardResponse,
  SendEstimateResponse,
} from "@hmk/contracts/scoring";

import type { ScoringDriver } from "../dsl/drivers.ts";

// Owned by the scoring group: replace each `pending(...)` with calls through `player.http`.
export const scoringDriver: ScoringDriver = {
  estimate: async (player, code, value) => {
    const game = await player.http.get(`/api/games/${code}`, GameView);
    if (!game.currentRound) {
      throw new Error(`Game ${code} has no current round`);
    }
    await player.http.post(
      `/api/scoring/${code}/${game.currentRound}/estimates`,
      { value },
      SendEstimateResponse
    );
  },
  scoreboard: async (player, code) => {
    const res = await player.http.get(
      `/api/scoring/${code}/scoreboard`,
      ScoreboardResponse
    );
    return res.players.map((p) => ({
      nickname: p.nickname,
      points: p.points,
    }));
  },
};
