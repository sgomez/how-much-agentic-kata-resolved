import type { ScoreboardResponse } from "@hmk/contracts/scoring";
import {
  BottomActionBar,
  FinalPodium,
  Heading,
  Screen,
  Stack,
  TopBar,
} from "@hmk/ui";
import type { ReactNode } from "react";

import { api } from "../../shell/api.ts";
import { authClient } from "../../shell/auth-client.ts";
import { useView } from "../../shell/use-view.ts";

export interface FinalRankingScreenProps {
  gameCode: string;
  bottomSlot?: ReactNode;
}

export const FinalRankingScreen = ({
  gameCode,
  bottomSlot,
}: FinalRankingScreenProps) => {
  const { data: session } = authClient.useSession();
  const youId = session?.user?.id;

  const { data: view } = useView(["scoreboard", gameCode], () =>
    api<ScoreboardResponse>(`/scoring/${gameCode}/scoreboard`)
  );

  const players = (view?.players ?? []).map((p) => ({
    id: p.id,
    name: p.nickname,
    score: p.points,
  }));

  const winner = players[0]?.name;

  return (
    <Screen
      top={<TopBar gameCode={gameCode} />}
      bottom={
        bottomSlot ? <BottomActionBar>{bottomSlot}</BottomActionBar> : undefined
      }
    >
      <Stack gap={2}>
        <Heading level={1} size="display" align="center">
          {winner ? `¡Ganó ${winner}!` : "Clasificación final"}
        </Heading>
        <FinalPodium players={players} youId={youId} />
      </Stack>
    </Screen>
  );
};
