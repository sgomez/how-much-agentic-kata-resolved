import { GameView } from "@hmk/contracts/games";
import { SendEstimateResponse } from "@hmk/contracts/scoring";

import type { ScoringDriver } from "../dsl/drivers.ts";
import { pendingIn } from "../dsl/pending-contract.ts";

const pending = pendingIn("scoring", "acceptance/drivers/scoring.ts");

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
  scoreboard: () => pending("ScoringDriver.scoreboard"),
};
