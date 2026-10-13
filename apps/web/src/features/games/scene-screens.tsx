import { EmptyState, Screen, Spinner, Stack, TopBar } from "@hmk/ui";

import { LobbyScreen } from "./lobby-screen.tsx";
import type { SceneScreen } from "./scene-director.ts";
import type { SceneScreenProps } from "./scene-screen-props.ts";

const Placeholder = ({
  title,
  group,
  code,
  bottom,
  banner,
  overlays,
}: SceneScreenProps & { title: string; group: string }) => (
  <Screen
    top={<TopBar gameCode={code} />}
    bottom={bottom}
    banner={banner}
    overlays={overlays}
    centered
  >
    <EmptyState
      icon="ruler"
      title={title}
      description={`Esta pantalla la construye el grupo «${group}».`}
    />
  </Screen>
);

const Loading = ({ code, banner, overlays }: SceneScreenProps) => (
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

// Screens of the other groups not exported yet. When a group exports its screen
// from its feature `index.ts`, import it here and render it instead of the placeholder.
const placeholders: Record<
  Exclude<SceneScreen, "loading" | "lobby">,
  { title: string; group: string }
> = {
  round: { title: "Ronda", group: "rounds" },
  reveal: { title: "Resultado de la ronda", group: "scoring" },
  voting: { title: "Votación", group: "impostor" },
  verdict: { title: "Veredicto", group: "impostor" },
  scoreboard: { title: "Clasificación", group: "scoring" },
  "final-ranking": { title: "Clasificación final", group: "scoring" },
};

export const SceneScreenView = ({
  screen,
  ...props
}: SceneScreenProps & { screen: SceneScreen }) => {
  if (screen === "loading") {
    return <Loading {...props} />;
  }
  if (screen === "lobby") {
    return <LobbyScreen {...props} />;
  }
  return <Placeholder {...props} {...placeholders[screen]} />;
};
