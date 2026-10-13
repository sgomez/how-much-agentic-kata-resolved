import type { GameView } from "@hmk/contracts/games";
import type { RoundViewResponse } from "@hmk/contracts/rounds";
import type { ListEstimatesResponse } from "@hmk/contracts/scoring";
import {
  AnswerTracker,
  BottomActionBar,
  Button,
  Countdown,
  EstimateRuler,
  QuestionCard,
  Screen,
  Skeleton,
  Stack,
  TopBar,
} from "@hmk/ui";
import { useState } from "react";
import type { ReactNode } from "react";

import { ApiError, api } from "../../shell/api.ts";
import type { SceneScreenProps } from "../../shell/scene.ts";
import { useView } from "../../shell/use-view.ts";
import { AfterSendingScreen } from "./after-sending-screen.tsx";

export type RoundScreenProps = SceneScreenProps;

export const RoundScreen = ({
  code: gameCode,
  round: currentRound,
  bottom,
  banner,
  overlays,
}: RoundScreenProps) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(false);

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

  const { data: estimates, refetch: refetchEstimates } =
    useView<ListEstimatesResponse | null>(
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

  if (!game || !roundView) {
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

  const sentValue = estimates?.myEstimate ?? null;
  const isSent = sentValue !== null;

  if (isSent && !editing) {
    return (
      <AfterSendingScreen
        code={gameCode}
        round={currentRound}
        bottom={bottom}
        banner={banner}
        overlays={overlays}
        onEdit={() => setEditing(true)}
      />
    );
  }

  const currentValue = selected ?? sentValue;
  const changed = isSent && currentValue !== null && currentValue !== sentValue;
  const isTimeUp =
    roundView.phase === "revealed" ||
    new Date(roundView.serverNow).getTime() >=
      new Date(roundView.deadline).getTime();

  const handleSend = async () => {
    if (currentValue === null) {
      return;
    }
    setSubmitting(true);
    try {
      await api(`/scoring/${gameCode}/${currentRound}/estimates`, {
        method: "POST",
        body: { value: currentValue },
      });
      setSelected(null);
      await refetchEstimates();
      setEditing(false);
      setSubmitting(false);
    } catch (error) {
      setSubmitting(false);
      throw error;
    }
  };

  const roundHint = () => {
    if (isTimeUp) {
      return "Se acabó el tiempo";
    }
    if (currentValue === null) {
      return "Elige un valor en la regla para enviar";
    }
    if (isSent) {
      return changed
        ? "Has movido la regla: pulsa Cambiar para enviarla"
        : "Puedes cambiarla hasta que acabe el tiempo";
    }
  };

  const trackerPlayers = (game.players ?? []).map((p) => ({
    id: p.id,
    name: p.nickname,
    answered: estimates?.answered?.includes(p.id) ?? false,
  }));

  let action: ReactNode;
  if (isTimeUp) {
    action = (
      <Button size="lg" fullWidth disabled icon="clock">
        Se acabó el tiempo
      </Button>
    );
  } else if (isSent) {
    action = (
      <Button
        size="lg"
        fullWidth
        icon="pencil"
        disabled={!changed || submitting}
        loading={submitting}
        onClick={handleSend}
      >
        Cambiar
      </Button>
    );
  } else {
    action = (
      <Button
        size="lg"
        fullWidth
        icon="send"
        disabled={currentValue === null || submitting}
        loading={submitting}
        onClick={handleSend}
      >
        Enviar
      </Button>
    );
  }

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
        <BottomActionBar hint={roundHint()}>
          <AnswerTracker players={trackerPlayers} compact />
          {action}
          {bottom}
        </BottomActionBar>
      }
      banner={banner}
      overlays={overlays}
    >
      <Stack gap={4} grow>
        <QuestionCard
          question={roundView.question ?? undefined}
          unit={roundView.unit}
          impostor={roundView.isImpostor}
        />
        <EstimateRuler
          min={roundView.min}
          max={roundView.max}
          unit={roundView.unit}
          scale="auto"
          value={currentValue}
          onChange={setSelected}
          sentValue={sentValue}
          disabled={isTimeUp}
        />
      </Stack>
    </Screen>
  );
};
