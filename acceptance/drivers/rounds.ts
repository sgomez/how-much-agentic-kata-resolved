import { GameView } from "@hmk/contracts/games";
import { RoundViewResponse } from "@hmk/contracts/rounds";
import { ListEstimatesResponse } from "@hmk/contracts/scoring";

import type { Player, RoundScreen, RoundsDriver } from "../dsl/drivers.ts";

// Owned by the rounds group: replace each `pending(...)` with calls through `player.http`.
export const roundsDriver: RoundsDriver = {
  currentRound: async (
    player: Player,
    code: string
  ): Promise<RoundScreen | null> => {
    const game = await player.http.get(`/games/${code}`, GameView);
    if (game.currentRound === null) {
      return null;
    }

    const res = await player.http.request(
      "GET",
      `/rounds/${code}/${game.currentRound}`
    );
    if (res.status === 404) {
      return null;
    }

    const round = RoundViewResponse.parse(res.body);

    let myEstimate: number | null = null;
    const scoringRes = await player.http.request(
      "GET",
      `/scoring/${code}/${game.currentRound}/estimates`
    );
    if (scoringRes.status === 200) {
      const { myEstimate: parsedEstimate } = ListEstimatesResponse.parse(
        scoringRes.body
      );
      myEstimate = parsedEstimate;
    }

    return {
      max: round.max,
      min: round.min,
      myEstimate,
      number: round.number,
      phase: round.phase,
      question: round.question,
      solution: round.solution,
      unit: round.unit,
    };
  },
};
