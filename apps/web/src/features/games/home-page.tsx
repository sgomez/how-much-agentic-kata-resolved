import type {
  CreateGameRequest,
  CreateGameResponse,
} from "@hmk/contracts/games";
import {
  Avatar,
  BottomActionBar,
  Button,
  CodeInput,
  Heading,
  Screen,
  Stack,
  Switch,
  Text,
  Toast,
  TopBar,
} from "@hmk/ui";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router";

import { api, ApiError } from "../../shell/api.ts";
import { authClient } from "../../shell/auth-client.ts";
import { JoinErrorScreen } from "./join-error-screen.tsx";

/** The settings a game gets when the host only taps "Crear partida". */
const DEFAULT_ROUND_SECONDS = 30;

/** Home (02): create a game. The only setting on it is the impostor mode. */
export const GamesHomePage = () => {
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();
  const player = session?.user;
  const [impostorMode, setImpostorMode] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const create = useMutation({
    mutationFn: () => {
      const body: CreateGameRequest = {
        impostorMode,
        roundSeconds: DEFAULT_ROUND_SECONDS,
      };
      return api<CreateGameResponse>("/games", { body });
    },
    onSuccess: ({ code }) => navigate(`/games/${code}`),
  });
  const join = useMutation({
    mutationFn: (code: string) =>
      api<undefined>(`/games/${code}/players`, { method: "POST" }),
    onSuccess: (_, code) => navigate(`/games/${code}`),
  });
  if (join.error instanceof ApiError) {
    return (
      <JoinErrorScreen code={join.error.code} onBack={() => join.reset()} />
    );
  }
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
      overlays={
        <Toast
          open={create.isError}
          message="No se ha podido crear la partida. Inténtalo de nuevo"
          tone="danger"
          onClose={() => create.reset()}
        />
      }
      bottom={
        <BottomActionBar>
          <Button
            size="lg"
            fullWidth
            icon="play"
            loading={create.isPending}
            onClick={() => create.mutate()}
          >
            Crear partida
          </Button>
        </BottomActionBar>
      }
    >
      <Stack gap={6}>
        <Stack gap={2}>
          <Heading level={1} size="display">
            ¡Hola{player === undefined ? "" : `, ${player.name}`}!
          </Heading>
          <Text tone="muted">Crea tu partida y comparte el código.</Text>
        </Stack>
        <Stack gap={3}>
          <CodeInput
            value={joinCode}
            onChange={setJoinCode}
            onComplete={(code) => join.mutate(code)}
          />
          <Button
            variant="secondary"
            fullWidth
            disabled={joinCode.length < 4}
            loading={join.isPending}
            onClick={() => join.mutate(joinCode)}
          >
            Unirse
          </Button>
        </Stack>
        <Switch
          label="Modo impostor"
          description="Cada ronda, alguien no verá la pregunta"
          checked={impostorMode}
          onChange={setImpostorMode}
        />
      </Stack>
    </Screen>
  );
};
