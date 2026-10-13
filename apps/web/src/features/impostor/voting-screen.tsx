import {
  BottomActionBar,
  Button,
  EmptyState,
  Grid,
  Heading,
  Screen,
  Stack,
  Text,
  TopBar,
  VoteOption,
} from "@hmk/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { api } from "../../shell/api.ts";
import { authClient } from "../../shell/auth-client.ts";
import type { SceneScreenProps } from "../../shell/scene.ts";
import { errorMessage } from "./errors.ts";
import { useGame, useVoting } from "./use-impostor-round.ts";

/** Screen 07 Voting. The games scene director mounts it while the voting is `open`. */
export const VotingScreen = ({
  code: gameCode,
  round,
  banner,
  overlays,
}: SceneScreenProps) => {
  const { data: session } = authClient.useSession();
  const { data: game } = useGame(gameCode);
  const { data: view } = useVoting(gameCode, round);
  const queryClient = useQueryClient();
  const [pick, setPick] = useState<string | null>(null);

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ["impostor", gameCode] });
  const vote = useMutation({
    mutationFn: (suspectNickname: string) =>
      api(`/impostor/${gameCode}/${round}/votes`, {
        method: "POST",
        body: { suspectNickname },
      }),
    onSettled: refresh,
  });
  const close = useMutation({
    mutationFn: () =>
      api(`/impostor/${gameCode}/${round}/voting/close`, { method: "POST" }),
    onSettled: refresh,
  });

  const top = (
    <TopBar
      gameCode={gameCode}
      round={round}
      {...(game === undefined ? {} : { totalRounds: game.settings.rounds })}
    />
  );
  const me = session?.user.id;
  if (game === undefined || view === undefined || me === undefined) {
    return (
      <Screen top={top} banner={banner} overlays={overlays} centered>
        <EmptyState icon="refresh" title="Cargando la votación…" />
      </Screen>
    );
  }

  const isHost = me === game.hostId;
  // After a reload no tile is selected, but our id is in `voters`.
  const voted = view.voters.includes(me);
  const missing = view.candidates.filter(
    (c) => !view.voters.includes(c.id)
  ).length;
  const failure = vote.error ?? close.error;
  const hint =
    failure === null
      ? `${voted ? "Voto enviado. " : ""}Faltan ${missing} por votar`
      : errorMessage(failure);

  const send = () => {
    const suspect = view.candidates.find((c) => c.id === pick);
    if (suspect !== undefined) {
      vote.mutate(suspect.nickname);
    }
  };

  return (
    <Screen
      top={top}
      banner={banner}
      overlays={overlays}
      bottom={
        <BottomActionBar hint={hint}>
          <Stack gap={2}>
            {voted ? (
              <Button size="lg" fullWidth disabled icon="lock">
                Voto enviado
              </Button>
            ) : (
              <Button
                size="lg"
                fullWidth
                icon="vote"
                disabled={pick === null || vote.isPending}
                onClick={send}
              >
                Votar
              </Button>
            )}
            {isHost ? (
              <Button
                variant="secondary"
                fullWidth
                disabled={close.isPending}
                onClick={() => close.mutate()}
              >
                Cerrar votación
              </Button>
            ) : null}
          </Stack>
        </BottomActionBar>
      }
    >
      <Stack gap={4}>
        <Stack gap={1}>
          <Heading level={1}>¿Quién era el impostor?</Heading>
          <Text tone="muted">
            Alguien no vio la pregunta. Vota a quien creas que se lo inventó.
          </Text>
        </Stack>
        <Grid cols={2}>
          {view.candidates.map((c) => {
            const self = c.id === me;
            return (
              <VoteOption
                key={c.id}
                player={{ id: c.id, name: c.nickname }}
                selected={pick === c.id}
                voted={voted && pick === c.id}
                locked={voted}
                disabled={self}
                {...(self ? { note: "Eres tú · no puedes" } : {})}
                onSelect={() => setPick(c.id)}
              />
            );
          })}
        </Grid>
      </Stack>
    </Screen>
  );
};
