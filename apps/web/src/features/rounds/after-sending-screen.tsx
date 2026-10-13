import type { GameView } from "@hmk/contracts/games";
import type { RoundViewResponse } from "@hmk/contracts/rounds";
import type { ListEstimatesResponse } from "@hmk/contracts/scoring";
import {
  AnswerTracker,
  Badge,
  BottomActionBar,
  Button,
  Countdown,
  PlayerList,
  Screen,
  Skeleton,
  Stack,
  Text,
  TopBar,
  formatNumber,
} from "@hmk/ui";

import { ApiError, api } from "../../shell/api.ts";
import type { SceneScreenProps } from "../../shell/scene.ts";
import { useView } from "../../shell/use-view.ts";

export interface AfterSendingScreenProps extends SceneScreenProps {
  onEdit?: () => void;
}

export const AfterSendingScreen = ({
  code: gameCode,
  round: currentRound,
  bottom,
  banner,
  overlays,
  onEdit,
}: AfterSendingScreenProps) => {
  const { data: game } = useView<GameView | null>(
    ["game", gameCode],
    async () => {
      try {
        return await api<GameView>(`/games/${gameCode}`);
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          return null;
        }
        throw error;
      }
    }
  );

  const { data: roundView } = useView<RoundViewResponse | null>(
    ["round", gameCode, currentRound],
    async () => {
      try {
        return await api<RoundViewResponse>(
          `/rounds/${gameCode}/${currentRound}`
        );
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          return null;
        }
        throw error;
      }
    }
  );

  const { data: estimates } = useView<ListEstimatesResponse | null>(
    ["scoring", gameCode, currentRound],
    async () => {
      try {
        return await api<ListEstimatesResponse>(
          `/scoring/${gameCode}/${currentRound}/estimates`
        );
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          return null;
        }
        throw error;
      }
    }
  );

  if (!game || !roundView || !estimates) {
    return (
      <Screen
        top={<TopBar gameCode={gameCode} />}
        bottom={bottom}
        banner={banner}
        overlays={overlays}
      >
        <Stack gap={4}>
          <Skeleton shape="block" height={120} />
          <Skeleton shape="block" height={320} />
        </Stack>
      </Screen>
    );
  }

  const sentValue = estimates.myEstimate;
  const isTimeUp =
    roundView.phase === "revealed" ||
    new Date(roundView.serverNow).getTime() >=
      new Date(roundView.deadline).getTime();

  const trackerPlayers = (game.players ?? []).map((p) => ({
    id: p.id,
    name: p.nickname,
    answered: estimates.answered.includes(p.id),
  }));

  const playerListItems = (game.players ?? []).map((p) => ({
    id: p.id,
    name: p.nickname,
    host: p.id === game.hostId,
    status: (estimates.answered.includes(p.id) ? "answered" : "waiting") as
      | "answered"
      | "waiting",
  }));

  const everyoneIn =
    (game.players ?? []).length > 0 &&
    (game.players ?? []).every((p) => estimates.answered.includes(p.id));

  const bottomHint = () => {
    if (isTimeUp) {
      return "Se acabó el tiempo";
    }
    if (everyoneIn) {
      return;
    }
    return "Puedes cambiarla hasta que acabe el tiempo";
  };

  return (
    <Screen
      top={
        <TopBar
          gameCode={gameCode}
          round={roundView.number}
          totalRounds={game.settings.rounds}
          trailing={
            <Countdown
              endsAt={roundView.deadline}
              serverNow={roundView.serverNow}
              duration={roundView.roundSeconds}
            />
          }
        />
      }
      bottom={
        <BottomActionBar hint={bottomHint()}>
          <Button
            size="lg"
            fullWidth
            variant="secondary"
            icon="pencil"
            disabled={isTimeUp}
            onClick={onEdit}
          >
            Cambiar mi estimación
          </Button>
          {bottom}
        </BottomActionBar>
      }
      banner={banner}
      overlays={overlays}
    >
      <Stack gap={5}>
        <Stack
          gap={3}
          align="center"
          className="border-line bg-success-soft rounded-lg border-2 p-5 text-center"
        >
          <Badge
            tone="success"
            variant="solid"
            icon="check"
            className="animate-stamp"
          >
            Enviado
          </Badge>
          <Text size="sm" tone="muted">
            Tu estimación
          </Text>
          <Text
            as="span"
            weight="bold"
            className="condensed text-estimate text-ink leading-none font-extrabold"
          >
            {sentValue !== null && sentValue !== undefined
              ? formatNumber(sentValue)
              : "—"}
          </Text>
          {roundView.unit ? <Text tone="muted">{roundView.unit}</Text> : null}
        </Stack>
        <AnswerTracker players={trackerPlayers} />
        {everyoneIn ? (
          <Text align="center" weight="bold" tone="success">
            ¡Ya habéis respondido todos! Esperando al final del tiempo…
          </Text>
        ) : null}
        <PlayerList players={playerListItems} showAnswerStatus />
      </Stack>
    </Screen>
  );
};
