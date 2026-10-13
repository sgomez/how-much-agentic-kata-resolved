import {
  Avatar,
  Card,
  EmptyState,
  Heading,
  Screen,
  ScoreDelta,
  Stack,
  Text,
  TopBar,
  VerdictCard,
} from "@hmk/ui";

import type { SceneScreenProps } from "../../shell/scene.ts";
import { useGame, useVoting } from "./use-impostor-round.ts";

/** Points an impostor who escapes gets (Scoring's rule, as answered). */
const ESCAPED_IMPOSTOR_POINTS = 5;
/** Points every other candidate gets when the impostor is caught. */
const CATCHING_BONUS = 2;

/** Screen 08 Verdict: who the impostor was, whether they were caught, and the points that come with it. */
export const VerdictScreen = ({
  code,
  round,
  bottom,
  banner,
  overlays,
}: SceneScreenProps) => {
  const { data: game } = useGame(code);
  const { data: view } = useVoting(code, round);

  const top = (
    <TopBar
      gameCode={code}
      round={round}
      {...(game === undefined ? {} : { totalRounds: game.settings.rounds })}
    />
  );
  const impostor = view?.candidates.find((c) => c.id === view.impostorId);
  if (view === undefined || view.voting !== "over" || impostor === undefined) {
    return (
      <Screen top={top} banner={banner} overlays={overlays} centered>
        <EmptyState icon="refresh" title="Cargando el veredicto…" />
      </Screen>
    );
  }

  // A tie or nobody voting arrives as `escaped`; there is no third outcome.
  const caught = view.verdict === "caught";
  const catchers = caught
    ? view.candidates.filter((c) => c.id !== impostor.id)
    : [];

  return (
    <Screen top={top} bottom={bottom} banner={banner} overlays={overlays}>
      <Stack gap={5}>
        <VerdictCard
          outcome={caught ? "caught" : "escaped"}
          impostor={{ id: impostor.id, name: impostor.nickname }}
          impostorPoints={caught ? 0 : ESCAPED_IMPOSTOR_POINTS}
        />
        {catchers.length > 0 ? (
          <Stack gap={2}>
            <Heading level={2}>Le habéis pillado</Heading>
            {catchers.map((c) => (
              <Card key={c.id} tone="sunken">
                <Stack direction="row" align="center" justify="between" gap={3}>
                  <Avatar player={{ id: c.id, name: c.nickname }} size="sm" />
                  <Text weight="bold">{c.nickname}</Text>
                  <ScoreDelta
                    points={CATCHING_BONUS}
                    reason="caught"
                    size="sm"
                  />
                </Stack>
              </Card>
            ))}
          </Stack>
        ) : null}
      </Stack>
    </Screen>
  );
};
