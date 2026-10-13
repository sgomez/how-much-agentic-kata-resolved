import type { GameView } from "@hmk/contracts/games";
import {
  ConnectionBanner,
  DetailList,
  EmptyState,
  GameCodeDisplay,
  Heading,
  IconButton,
  PlayerList,
  Screen,
  Skeleton,
  Stack,
  TopBar,
} from "@hmk/ui";
import { useNavigate, useParams } from "react-router";

import { ApiError, api } from "../../shell/api.ts";
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
export const LobbyPage = () => {
  const { code = "" } = useParams();
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();
  const { data: view, error } = useView(["game", code], () =>
    api<GameView>(`/games/${code}`)
  );
  const home = (
    <TopBar
      leading={
        <IconButton
          icon="chevron-left"
          label="Volver al inicio"
          variant="ghost"
          onClick={() => navigate("/games")}
        />
      }
    />
  );

  if (error instanceof ApiError && error.code === "unknown-code") {
    return (
      <Screen centered top={home}>
        <EmptyState
          icon="alert"
          tone="danger"
          title="Esa partida no existe"
          description="Revisa el código e inténtalo de nuevo."
        />
      </Screen>
    );
  }
  if (view === undefined) {
    return (
      <Screen
        top={home}
        banner={
          <ConnectionBanner
            status={error === null ? "connected" : "reconnecting"}
          />
        }
      >
        <Skeleton shape="circle" />
      </Screen>
    );
  }
  return (
    <Screen
      top={<TopBar gameCode={view.code} />}
      banner={
        <ConnectionBanner
          status={error === null ? "connected" : "reconnecting"}
        />
      }
    >
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
    </Screen>
  );
};
