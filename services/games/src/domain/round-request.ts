import type { CreateRoundRequest } from "@hmk/contracts/rounds";

import type { Game } from "./game.aggregate.ts";

/** What rounds needs to create a round of `game`. */
export const roundRequest = (game: Game): CreateRoundRequest => ({
  hostId: game.host.id,
  impostorMode: game.settings.impostorMode,
  // Rounds takes `packs` only when the host picked some.
  ...(game.settings.packs.length === 0
    ? {}
    : { packs: [...game.settings.packs] }),
  players: [...game.players],
  roundSeconds: game.settings.roundSeconds,
});
