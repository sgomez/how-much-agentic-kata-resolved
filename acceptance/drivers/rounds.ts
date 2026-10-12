import type { RoundsDriver } from "../dsl/drivers.ts";
import { pendingIn } from "../dsl/pending-contract.ts";

const pending = pendingIn("rounds", "acceptance/drivers/rounds.ts");

// Owned by the rounds group: replace each `pending(...)` with calls through `player.http`.
export const roundsDriver: RoundsDriver = {
  currentRound: () => pending("RoundsDriver.currentRound"),
};
