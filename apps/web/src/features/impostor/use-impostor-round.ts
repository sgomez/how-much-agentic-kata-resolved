import type { GameView } from "@hmk/contracts/games";
import type { VotingView } from "@hmk/contracts/impostor";

import { api } from "../../shell/api.ts";
import { useView } from "../../shell/use-view.ts";

/** The game view, polled by every screen of the game: gives the current round and the host. */
export const useGame = (code: string) =>
  useView(["game", code], () => api<GameView>(`/games/${code}`));

/** The voting view of the game's current round; waits until the game has a current round. */
export const useVoting = (code: string, round: number | null | undefined) =>
  useView(["impostor", code, round], () =>
    round === null || round === undefined
      ? Promise.resolve(null)
      : api<VotingView>(`/impostor/${code}/${round}`)
  );
