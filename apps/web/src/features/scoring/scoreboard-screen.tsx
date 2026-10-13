import type { ScoreboardResponse } from "@hmk/contracts/scoring";
import {
  BottomActionBar,
  Heading,
  Scoreboard,
  Screen,
  Stack,
  TopBar,
} from "@hmk/ui";
import type { ReactNode } from "react";

import { api } from "../../shell/api.ts";
import { authClient } from "../../shell/auth-client.ts";
import { useView } from "../../shell/use-view.ts";

export interface ScoreboardScreenProps {
  gameCode: string;
  bottomSlot?: ReactNode;
}

export const ScoreboardScreen = ({
  gameCode,
  bottomSlot,
}: ScoreboardScreenProps) => {
  const { data: session } = authClient.useSession();
  const youId = session?.user?.id;

  const { data: view } = useView(["scoreboard", gameCode], () =>
    api<ScoreboardResponse>(`/scoring/${gameCode}/scoreboard`)
  );

  const rows = (view?.players ?? []).map((p) => ({
    id: p.id,
    name: p.nickname,
    score: p.points,
  }));

  return (
    <Screen
      top={<TopBar gameCode={gameCode} />}
      bottom={
        bottomSlot ? <BottomActionBar>{bottomSlot}</BottomActionBar> : undefined
      }
    >
      <Stack gap={4}>
        <Heading level={1}>Clasificación</Heading>
        <Scoreboard rows={rows} youId={youId} />
      </Stack>
    </Screen>
  );
};
