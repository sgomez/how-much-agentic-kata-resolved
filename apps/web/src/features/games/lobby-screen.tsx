import type { GameView } from "@hmk/contracts/games";
import {
  ConnectionBanner,
  DetailList,
  GameCodeDisplay,
  Heading,
  PlayerList,
  Screen,
  Skeleton,
  Stack,
  TopBar,
} from "@hmk/ui";
import type { ReactNode } from "react";

import { api } from "../../shell/api.ts";
import { authClient } from "../../shell/auth-client.ts";
import { useView } from "../../shell/use-view.ts";

const settingsRows = ({ settings }: GameView) => [
  { label: "Rondas", value: String(settings.rounds) },
  { label: "Segundos por ronda", value: String(settings.roundSeconds) },
  { label: "Modo impostor", value: settings.impostorMode ? "Sí" : "No" },
  {
    label: "Paquetes de preguntas",
    value: settings.packs.length === 0 ? "Todos" : settings.packs.join(", "),
  },
];

/** Lobby (03): the code, who is in, and the settings, read-only for everyone. */
export const LobbyScreen = ({
  code,
  bottom,
}: {
  code: string;
  bottom?: ReactNode;
}) => {
  const { data: session } = authClient.useSession();
  const { data: view, error } = useView(["game", code], () =>
    api<GameView>(`/games/${code}`)
  );
  return (
    <Screen
      top={<TopBar gameCode={code} />}
      banner={
        <ConnectionBanner
          status={error === null ? "connected" : "reconnecting"}
        />
      }
      bottom={bottom}
    >
      {view === undefined ? (
        <Skeleton shape="circle" />
      ) : (
        <Stack gap={6}>
          <GameCodeDisplay code={view.code} />
          <Stack gap={3}>
            <Heading level={2}>Jugadores</Heading>
            <PlayerList
              players={view.players.map(({ id, nickname }) => ({
                host: id === view.hostId,
                id,
                name: nickname,
              }))}
              {...(session === null ? {} : { youId: session.user.id })}
            />
          </Stack>
          <DetailList title="Ajustes" items={settingsRows(view)} />
        </Stack>
      )}
    </Screen>
  );
};
