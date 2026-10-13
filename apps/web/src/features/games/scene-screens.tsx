import { Screen, Spinner, Stack, TopBar } from "@hmk/ui";
import type { ReactNode } from "react";

import type { SceneScreenProps } from "../../shell/scene.ts";
import { VerdictScreen, VotingScreen } from "../impostor/index.ts";
import { RoundScreen } from "../rounds/index.ts";
import {
  FinalRankingScreen,
  RevealScreen,
  ScoreboardScreen,
} from "../scoring/index.ts";
import { LobbyScreen } from "./lobby-screen.tsx";
import type { SceneScreen } from "./scene-director.ts";

const Loading = ({
  code,
  banner,
  overlays,
}: Pick<SceneScreenProps, "code" | "banner" | "overlays">) => (
  <Screen
    top={<TopBar gameCode={code} />}
    banner={banner}
    overlays={overlays}
    centered
  >
    <Stack align="center">
      <Spinner size={32} />
    </Stack>
  </Screen>
);

const screens: Record<
  Exclude<SceneScreen, "loading" | "lobby">,
  (props: SceneScreenProps) => ReactNode
> = {
  round: RoundScreen,
  reveal: RevealScreen,
  voting: VotingScreen,
  verdict: VerdictScreen,
  scoreboard: ScoreboardScreen,
  "final-ranking": FinalRankingScreen,
};

/** `round` is null while the game is in the lobby; every later screen needs it. */
export const SceneScreenView = ({
  screen,
  round,
  ...props
}: Omit<SceneScreenProps, "round"> & {
  screen: SceneScreen;
  round?: number | null;
}) => {
  if (screen === "lobby") {
    return <LobbyScreen {...props} />;
  }
  if (screen === "loading" || round === null || round === undefined) {
    return <Loading {...props} />;
  }
  const Current = screens[screen];
  return <Current {...props} round={round} />;
};
