import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useState } from "react";

import { noop, PLAYERS, player, withScores, YOU } from "../stories/fixtures.ts";
import { Phone } from "../stories/helpers.tsx";
import { FinalPodium } from "./final-podium.tsx";
import { Scoreboard } from "./scoreboard.tsx";
import type { ScoreRow } from "./scoreboard.tsx";
import { Grid } from "./stack.tsx";
import { VerdictCard } from "./verdict-card.tsx";
import { VoteOption } from "./vote-option.tsx";

const meta: Meta = {
  title: "Game/Results",
  decorators: [
    (Story) => (
      <Phone>
        <Story />
      </Phone>
    ),
  ],
};
export default meta;
type S = StoryObj;

const rows: ScoreRow[] = [
  {
    ...player(0),
    score: 14,
    delta: 3,
    deltaReason: "closest",
    previousRank: 2,
  },
  { ...player(1), score: 11, delta: 0, previousRank: 1 },
  {
    ...player(2),
    score: 11,
    delta: 5,
    deltaReason: "impostor",
    previousRank: 4,
  },
  { ...player(3), score: 6, delta: 0, previousRank: 3 },
  { ...player(4), score: 2, delta: 0, previousRank: 5 },
];
export const ScoreboardRound: S = {
  render: () => <Scoreboard rows={rows} youId={YOU.id} />,
};
export const ScoreboardEmptyScores: S = {
  render: () => (
    <Scoreboard rows={PLAYERS.slice(0, 4).map((p) => ({ ...p, score: 0 }))} />
  ),
};
/** Totals change every 2,5 s: rows glide to their new positions. */
const Moving = () => {
  const [k, setK] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setK((x) => x + 1), 2500);
    return () => window.clearInterval(t);
  }, []);
  const data = PLAYERS.slice(0, 5).map((p, i) => ({
    ...p,
    score: ((i * 7 + k * (i + 3)) % 17) + i,
  }));
  return <Scoreboard rows={data} youId={YOU.id} />;
};
export const ScoreboardReorders: S = { render: () => <Moving /> };

const Voting = ({
  locked,
  selfDisabled,
}: {
  locked?: boolean;
  selfDisabled?: boolean;
}) => {
  const [pick, setPick] = useState<string | null>(player(2).id);
  const [voted, setVoted] = useState(true);
  return (
    <Grid cols={2}>
      {PLAYERS.slice(0, 6).map((p) => (
        <VoteOption
          key={p.id}
          player={p}
          selected={pick === p.id}
          voted={voted && pick === p.id}
          locked={locked}
          disabled={selfDisabled && p.id === YOU.id}
          note={p.id === YOU.id ? "Eres tú" : undefined}
          onSelect={() => {
            setPick(p.id);
            setVoted(true);
          }}
        />
      ))}
    </Grid>
  );
};
export const VoteChangeable: S = { render: () => <Voting /> };
export const VoteFinal: S = { render: () => <Voting locked /> };
export const VoteSelfForbidden: S = { render: () => <Voting selfDisabled /> };
export const VoteNotYet: S = {
  render: () => (
    <Grid cols={2}>
      {PLAYERS.slice(0, 4).map((p) => (
        <VoteOption key={p.id} player={p} onSelect={noop} />
      ))}
    </Grid>
  ),
};

const voteTarget = (index: number) => {
  if (index === 4) {
    return null;
  }
  return index % 2 ? player(2) : player(3);
};
const votes = PLAYERS.slice(0, 5).map((p, i) => ({
  voter: p,
  target: voteTarget(i),
}));
export const VerdictCaught: S = {
  render: () => (
    <VerdictCard outcome="caught" impostor={player(2)} impostorPoints={0} />
  ),
};
export const VerdictEscaped: S = {
  render: () => (
    <VerdictCard outcome="escaped" impostor={player(2)} impostorPoints={5} />
  ),
};
export const VerdictNone: S = {
  render: () => (
    <VerdictCard
      outcome="none"
      impostor={player(2)}
      detail="Empate a 2 votos"
    />
  ),
};
export const VerdictWithVotes: S = {
  render: () => (
    <VerdictCard
      outcome="caught"
      impostor={player(2)}
      impostorPoints={0}
      votes={votes}
    />
  ),
};

export const Podium: S = {
  render: () => (
    <FinalPodium
      youId={YOU.id}
      players={withScores([23, 19, 17, 12, 12, 8, 3])}
    />
  ),
};
export const PodiumTieForFirst: S = {
  render: () => <FinalPodium players={withScores([20, 20, 9, 4])} />,
};
export const PodiumTwoPlayers: S = {
  render: () => <FinalPodium players={withScores([7, 4])} />,
};
