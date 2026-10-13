import { EmptyState, Screen, Spinner, Stack, TopBar } from "@hmk/ui";
import type { ReactNode } from "react";

import type { SceneScreen } from "./scene-director.ts";

/** What every screen of another group receives: the game code and the bottom-action slot. */
export interface SceneScreenProps {
  code: string;
  bottom?: ReactNode;
}

const Placeholder = ({
  title,
  group,
  code,
  bottom,
}: SceneScreenProps & { title: string; group: string }) => (
  <Screen top={<TopBar gameCode={code} />} bottom={bottom} centered>
    <EmptyState
      icon="ruler"
      title={title}
      description={`Esta pantalla la construye el grupo «${group}».`}
    />
  </Screen>
);

const Loading = ({ code }: SceneScreenProps) => (
  <Screen top={<TopBar gameCode={code} />} centered>
    <Stack align="center">
      <Spinner size={32} />
    </Stack>
  </Screen>
);

// Screens of the other groups not exported yet. When a group exports its screen
// from its feature `index.ts`, import it here and render it instead of the placeholder.
// The lobby is a placeholder until #31 lands.
const placeholders: Record<
  Exclude<SceneScreen, "loading">,
  { title: string; group: string }
> = {
  lobby: { title: "Sala de espera", group: "games" },
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
}: SceneScreenProps & { screen: SceneScreen }) =>
  screen === "loading" ? (
    <Loading {...props} />
  ) : (
    <Placeholder {...props} {...placeholders[screen]} />
  );
