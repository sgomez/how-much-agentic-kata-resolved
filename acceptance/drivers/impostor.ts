import { GameView } from "@hmk/contracts/games";
import { VotingView } from "@hmk/contracts/impostor";
import type { CastVoteRequest } from "@hmk/contracts/impostor";

import type { ImpostorDriver, Player } from "../dsl/drivers.ts";
import { waitFor } from "../dsl/wait.ts";
import { GatewayCallError } from "./gateway-http.ts";

/** The driver methods get no round number: it is the game's current one. */
const roundPath = async (player: Player, code: string): Promise<string> => {
  const game = await player.http.get(`/games/${code}`, GameView);
  if (game.currentRound === null) {
    throw new Error(`Game ${code} has no current round yet`);
  }
  return `/impostor/${code}/${String(game.currentRound)}`;
};

export const impostorDriver: ImpostorDriver = {
  openVoting: async (host, code) => {
    const path = await roundPath(host, code);
    // The round may not have reached its deadline yet: tap again, like the host would.
    await waitFor(
      "the round to be revealed so the voting can open",
      async () => {
        const res = await host.http.request("POST", `${path}/voting`);
        if (res.status === 204) {
          return true;
        }
        const code409 = (res.body as { error?: { code?: string } } | undefined)
          ?.error?.code;
        if (res.status === 409 && code409 === "round-not-revealed") {
          return;
        }
        throw new GatewayCallError(
          "POST",
          `${path}/voting`,
          res.status,
          res.body
        );
      }
    );
  },
  vote: async (player, code, suspectNickname) => {
    const path = await roundPath(player, code);
    const body: CastVoteRequest = { suspectNickname };
    await player.http.request("POST", `${path}/votes`, body).then((res) => {
      if (res.status !== 204) {
        throw new GatewayCallError(
          "POST",
          `${path}/votes`,
          res.status,
          res.body
        );
      }
    });
  },
  votingIsOver: async (player, code) => {
    const view = await player.http.get(
      await roundPath(player, code),
      VotingView
    );
    return view.voting === "over";
  },
};
