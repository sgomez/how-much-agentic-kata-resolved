import type { GameView } from "@hmk/contracts/games";
import type { RoundViewResponse } from "@hmk/contracts/rounds";
import {
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
import { useView } from "../../shell/use-view.ts";

export interface RoundScreenProps {
  gameCode: string;
  bottomSlot?: ReactNode;
  bottomAction?: ReactNode;
}

export const RoundScreen = ({
  gameCode,
  bottomSlot,
  bottomAction,
}: RoundScreenProps) => {
  const [value, setValue] = useState<number | null>(null);
  const bottom = bottomSlot ?? bottomAction;

  const { data: game } = useView<GameView | null>(
    ["games", gameCode],
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

  const currentRound = game?.currentRound;
  const { data: roundView } = useView<RoundViewResponse | null>(
    ["rounds", gameCode, currentRound],
    async () => {
      if (currentRound === null || currentRound === undefined) {
        return null;
      }
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

  if (!game || !currentRound || !roundView) {
    return (
      <Screen
        top={<TopBar gameCode={gameCode} />}
        bottom={
          bottom ? <BottomActionBar>{bottom}</BottomActionBar> : undefined
        }
      >
        <Stack gap={4}>
          <Skeleton shape="block" height={120} />
          <Skeleton shape="block" height={320} />
        </Stack>
      </Screen>
    );
  }

  const isTimeUp =
    roundView.phase === "revealed" ||
    new Date(roundView.serverNow).getTime() >=
      new Date(roundView.deadline).getTime();

  let hint: string | undefined;
  if (isTimeUp) {
    hint = "Se acabó el tiempo";
  } else if (value === null) {
    hint = "Elige un valor en la regla para enviar";
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
        <BottomActionBar hint={hint}>
          <Button
            size="lg"
            fullWidth
            icon={isTimeUp ? "clock" : "send"}
            disabled={isTimeUp || value === null}
          >
            {isTimeUp ? "Se acabó el tiempo" : "Enviar"}
          </Button>
          {bottom}
        </BottomActionBar>
      }
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
          value={value}
          onChange={setValue}
          disabled={isTimeUp}
        />
      </Stack>
    </Screen>
  );
};
