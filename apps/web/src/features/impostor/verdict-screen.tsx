import type { VotingView } from "@hmk/contracts/impostor";
import {
  Avatar,
  BottomActionBar,
  Button,
  Heading,
  Screen,
  ScoreDelta,
  Stack,
  Text,
  TopBar,
  VerdictCard,
} from "@hmk/ui";
import { useNavigate } from "react-router";

/** Points an impostor who escapes gets (Scoring's rule, as answered). */
const ESCAPED_IMPOSTOR_POINTS = 5;
/** Points every other candidate gets when the impostor is caught. */
const CATCHING_BONUS = 2;

/**
 * Fixed view of a voting that is over, until the service serves the real one.
 * Replace with `useView` on `/impostor/:code/:n` once it exists.
 */
const FIXED_VIEW: VotingView = {
  voting: "over",
  candidates: [
    { id: "p-1", nickname: "Lucía" },
    { id: "p-2", nickname: "Alex" },
    { id: "p-3", nickname: "Dani" },
    { id: "p-4", nickname: "Marta" },
  ],
  voters: ["p-1", "p-2", "p-3", "p-4"],
  verdict: "caught",
  impostorId: "p-2",
};

/** Screen 08 Verdict: who the impostor was, whether they were caught, and the points that come with it. */
export const VerdictScreen = ({ code }: { code: string }) => {
  const navigate = useNavigate();
  const view = FIXED_VIEW;
  const impostor = view.candidates.find((c) => c.id === view.impostorId);
  if (!impostor) {
    return null;
  }
  // A tie or nobody voting arrives as `escaped`; there is no third outcome.
  const caught = view.verdict === "caught";
  const catchers = caught
    ? view.candidates.filter((c) => c.id !== impostor.id)
    : [];

  return (
    <Screen
      top={<TopBar gameCode={code} />}
      bottom={
        <BottomActionBar>
          {/* Local navigation: only this phone moves to the scoreboard. */}
          <Button
            size="lg"
            fullWidth
            icon="arrow-right"
            onClick={() => navigate("/scoreboard")}
          >
            Ver clasificación
          </Button>
        </BottomActionBar>
      }
    >
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
              <Stack
                key={c.id}
                direction="row"
                align="center"
                gap={3}
                className="border-line-subtle bg-surface-raised rounded-md border-2 px-3 py-2"
              >
                <Avatar player={{ id: c.id, name: c.nickname }} size="sm" />
                <Text weight="bold" className="flex-1">
                  {c.nickname}
                </Text>
                <ScoreDelta points={CATCHING_BONUS} reason="caught" size="sm" />
              </Stack>
            ))}
          </Stack>
        ) : null}
      </Stack>
    </Screen>
  );
};
