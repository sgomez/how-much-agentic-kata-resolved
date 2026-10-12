import type { ScoringDriver } from "../dsl/drivers.ts";
import { pendingIn } from "../dsl/pending-contract.ts";

const pending = pendingIn("scoring", "acceptance/drivers/scoring.ts");

// Owned by the scoring group: replace each `pending(...)` with calls through `player.http`.
export const scoringDriver: ScoringDriver = {
  estimate: () => pending("ScoringDriver.estimate"),
  scoreboard: () => pending("ScoringDriver.scoreboard"),
};
