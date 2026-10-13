import type { GameView } from "@hmk/contracts/games";
import type { RoundViewResponse } from "@hmk/contracts/rounds";
import type { RevealResponse } from "@hmk/contracts/scoring";
import {
  BottomActionBar,
  Button,
  QuestionCard,
  RevealList,
  RevealRuler,
  Screen,
  Stack,
  TopBar,
} from "@hmk/ui";
import type { RevealListEntry } from "@hmk/ui";
import type { ReactNode } from "react";
import { useNavigate } from "react-router";

import { api } from "../../shell/api.ts";
import { authClient } from "../../shell/auth-client.ts";
import { useView } from "../../shell/use-view.ts";

export interface RevealScreenProps {
  gameCode: string;
  bottomSlot?: ReactNode;
  onNavigateToScoreboard?: () => void;
}

const scoreReason = (points: number): "exact" | "closest" | undefined => {
  if (points === 5) {
    return "exact";
  }
  if (points === 3) {
    return "closest";
  }
  return undefined;
};

const toRevealEntries = (
  players: GameView["players"] = [],
  estimates: RevealResponse["estimates"] = []
): RevealListEntry[] => {
  const estimatesMap = new Map(estimates.map((e) => [e.id, e]));

  const answeredEntries: RevealListEntry[] = estimates.map((e) => ({
    player: { id: e.id, name: e.nickname },
    points: e.points,
    reason: scoreReason(e.points),
    value: e.value,
  }));

  const missingEntries: RevealListEntry[] = players
    .filter((p) => !estimatesMap.has(p.id))
    .map((p) => ({
      player: { id: p.id, name: p.nickname },
      value: null,
    }));

  return [...answeredEntries, ...missingEntries];
};

const RevealBottom = ({
  bottomSlot,
  onNavigate,
}: {
  bottomSlot?: ReactNode;
  onNavigate: () => void;
}) => (
  <BottomActionBar>
    {bottomSlot ?? (
      <Button size="lg" fullWidth icon="trophy" onClick={onNavigate}>
        Ver clasificación
      </Button>
    )}
  </BottomActionBar>
);

export const RevealScreen = ({
  gameCode,
  bottomSlot,
  onNavigateToScoreboard,
}: RevealScreenProps) => {
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();
  const youId = session?.user?.id;

  const { data: game } = useView(["game", gameCode], () =>
    api<GameView>(`/games/${gameCode}`)
  );

  const currentRound = game?.currentRound ?? null;

  const { data: round } = useView(["round", gameCode, currentRound], () =>
    currentRound === null
      ? Promise.resolve(null as unknown as RoundViewResponse)
      : api<RoundViewResponse>(`/rounds/${gameCode}/${currentRound}`)
  );

  const { data: reveal } = useView(["reveal", gameCode, currentRound], () =>
    currentRound === null
      ? Promise.resolve(null as unknown as RevealResponse)
      : api<RevealResponse>(`/scoring/${gameCode}/${currentRound}/reveal`)
  );

  const allEntries = toRevealEntries(game?.players, reveal?.estimates);

  const rulerEstimates = allEntries.map((e) => ({
    player: e.player,
    value: e.value,
  }));

  const min = round?.min ?? 0;
  const max = round?.max ?? 100;
  const unit = round?.unit ?? "";
  const solution = reveal?.solution ?? 0;

  const handleNavigate = () => {
    if (onNavigateToScoreboard) {
      onNavigateToScoreboard();
    } else {
      navigate(gameCode ? `/scoreboard/${gameCode}` : "/scoreboard");
    }
  };

  return (
    <Screen
      top={
        <TopBar
          gameCode={gameCode}
          round={currentRound ?? undefined}
          totalRounds={game?.settings?.rounds}
        />
      }
      bottom={
        <RevealBottom bottomSlot={bottomSlot} onNavigate={handleNavigate} />
      }
    >
      <Stack gap={5}>
        {round?.question ? (
          <QuestionCard question={round.question} unit={round.unit} />
        ) : null}
        <RevealRuler
          min={min}
          max={max}
          unit={unit}
          solution={solution}
          estimates={rulerEstimates}
          height={300}
        />
        <RevealList
          unit={unit}
          solution={solution}
          entries={allEntries}
          youId={youId}
        />
      </Stack>
    </Screen>
  );
};
