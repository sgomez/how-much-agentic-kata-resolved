import { ListPacksResponse } from "@hmk/contracts/catalog";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Heading,
  Screen,
  Stack,
  Text,
  TopBar,
} from "@hmk/ui";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";

import { api } from "./api.ts";
import { authClient } from "./auth-client.ts";

/** Placeholder entry point: one link per group's screens, plus a system check. */
const SCREENS = [
  { to: "/games", label: "Partidas", group: "games" },
  { to: "/round", label: "Ronda", group: "rounds" },
  { to: "/scoreboard", label: "Marcador", group: "scoring" },
  { to: "/impostor", label: "Impostor", group: "impostor" },
] as const;

const CatalogStatus = () => {
  const { data, isError, isPending } = useQuery({
    queryKey: ["catalog", "packs"],
    queryFn: async () => ListPacksResponse.parse(await api("/catalog/packs")),
  });
  if (isPending) {
    return <Badge icon="refresh">Comprobando el catálogo…</Badge>;
  }
  if (isError) {
    return (
      <Badge tone="danger" icon="alert">
        El catálogo no responde
      </Badge>
    );
  }
  return (
    <Badge tone="success" icon="check">
      Catálogo conectado: {data.packs.length} packs de preguntas
    </Badge>
  );
};

export const HomePage = () => {
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();
  const player = session?.user;
  return (
    <Screen
      top={
        <TopBar
          trailing={
            player === undefined ? null : (
              <Stack direction="row" gap={2} align="center">
                <Text size="sm">{player.name}</Text>
                <Avatar player={player} size="sm" />
              </Stack>
            )
          }
        />
      }
    >
      <Stack gap={6}>
        <Heading level={1} size="display">
          ¡Hola{player === undefined ? "" : `, ${player.name}`}!
        </Heading>
        <Card>
          <Stack gap={3}>
            <Heading level={2}>Pantallas</Heading>
            {SCREENS.map((screen) => (
              <Button
                key={screen.to}
                variant="secondary"
                fullWidth
                icon="chevron-right"
                onClick={() => navigate(screen.to)}
              >
                {screen.label}
              </Button>
            ))}
          </Stack>
        </Card>
        <Stack gap={2}>
          <Text tone="muted" size="sm">
            Estado del sistema:
          </Text>
          <CatalogStatus />
        </Stack>
      </Stack>
    </Screen>
  );
};
