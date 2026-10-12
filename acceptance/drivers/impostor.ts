import type { ImpostorDriver } from "../dsl/drivers.ts";
import { pendingIn } from "../dsl/pending-contract.ts";

const pending = pendingIn("impostor", "acceptance/drivers/impostor.ts");

// Owned by the impostor group: replace each `pending(...)` with calls through `player.http`.
export const impostorDriver: ImpostorDriver = {
  openVoting: () => pending("ImpostorDriver.openVoting"),
  vote: () => pending("ImpostorDriver.vote"),
  votingIsOver: () => pending("ImpostorDriver.votingIsOver"),
};
