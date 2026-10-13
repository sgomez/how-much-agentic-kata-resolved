import type { ScoreboardResponse } from "@hmk/contracts/scoring";
import { FinalPodium, Heading, Screen, Stack, TopBar } from "@hmk/ui";

import { api } from "../../shell/api.ts";
import { authClient } from "../../shell/auth-client.ts";
import type { SceneScreenProps } from "../../shell/scene.ts";
import { useView } from "../../shell/use-view.ts";

export type FinalScoreboardScreenProps = SceneScreenProps;

export const FinalScoreboardScreen = ({
  code: gameCode,
  bottom,
  banner,
  overlays,
}: FinalScoreboardScreenProps) => {
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
      bottom={bottom}
      banner={banner}
      overlays={overlays}
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

export { FinalScoreboardScreen as FinalRankingScreen };
export type { FinalScoreboardScreenProps as FinalRankingScreenProps };
