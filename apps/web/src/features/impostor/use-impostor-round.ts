import type { GameView } from "@hmk/contracts/games";
import type { VotingView } from "@hmk/contracts/impostor";
import type { RoundViewResponse } from "@hmk/contracts/rounds";

import { api } from "../../shell/api.ts";
import { useView } from "../../shell/use-view.ts";

/** The voting view of `round`, which the scene director hands to the screen. */
export const useVoting = (code: string, round: number) =>
  useView(["impostor", code, round], () =>
    api<VotingView>(`/impostor/${code}/${round}`)
  );

/** The game view, polled by every screen of the game: gives the host and the settings. */
export const useGame = (code: string) =>
  useView(["game", code], () => api<GameView>(`/games/${code}`));

/** The round view, which alone tells a phone whether its player is the impostor. */
export const useRoundView = (code: string, round: number) =>
  useView(["round", code, round], () =>
    api<RoundViewResponse>(`/rounds/${code}/${round}`)
  );
