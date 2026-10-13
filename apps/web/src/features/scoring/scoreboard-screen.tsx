import type { ScoreboardResponse } from "@hmk/contracts/scoring";
import { Heading, Scoreboard, Screen, Stack, TopBar } from "@hmk/ui";

import { api } from "../../shell/api.ts";
import { authClient } from "../../shell/auth-client.ts";
import type { SceneScreenProps } from "../../shell/scene.ts";
import { useView } from "../../shell/use-view.ts";

export type ScoreboardScreenProps = SceneScreenProps;

export const ScoreboardScreen = ({
  code: gameCode,
  bottom,
  banner,
  overlays,
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
      bottom={bottom}
      banner={banner}
      overlays={overlays}
    >
      <Stack gap={4}>
        <Heading level={1}>Clasificación</Heading>
        <Scoreboard rows={rows} youId={youId} />
      </Stack>
    </Screen>
  );
};
