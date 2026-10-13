import type { GameView } from "@hmk/contracts/games";
import type { RoundViewResponse } from "@hmk/contracts/rounds";
import type { RevealResponse } from "@hmk/contracts/scoring";
import {
  QuestionCard,
  RevealList,
  RevealRuler,
  Screen,
  Stack,
  TopBar,
} from "@hmk/ui";
import type { RevealListEntry } from "@hmk/ui";

import { api } from "../../shell/api.ts";
import { authClient } from "../../shell/auth-client.ts";
import type { SceneScreenProps } from "../../shell/scene.ts";
import { useView } from "../../shell/use-view.ts";

export type RevealScreenProps = SceneScreenProps;

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

export const RevealScreen = ({
  code: gameCode,
  round: currentRound,
  bottom,
  banner,
  overlays,
}: RevealScreenProps) => {
  const { data: session } = authClient.useSession();
  const youId = session?.user?.id;

  const { data: game } = useView(["game", gameCode], () =>
    api<GameView>(`/games/${gameCode}`)
  );

  const { data: round } = useView(["round", gameCode, currentRound], () =>
    api<RoundViewResponse>(`/rounds/${gameCode}/${currentRound}`)
  );

  const { data: reveal } = useView(["reveal", gameCode, currentRound], () =>
    api<RevealResponse>(`/scoring/${gameCode}/${currentRound}/reveal`)
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

  return (
    <Screen
      top={
        <TopBar
          gameCode={gameCode}
          round={currentRound}
          totalRounds={game?.settings?.rounds}
        />
      }
      bottom={bottom}
      banner={banner}
      overlays={overlays}
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
