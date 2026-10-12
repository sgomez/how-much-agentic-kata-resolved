import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useState } from "react";

import { withDistinctNames } from "../lib/players.ts";
import {
  deadline,
  HOST,
  PLAYERS,
  GAME_CODE,
  YOU,
  QUESTIONS,
} from "../stories/fixtures.ts";
import { Phone } from "../stories/helpers.tsx";
import { AnswerTracker } from "./answer-tracker.tsx";
import { Countdown } from "./countdown.tsx";
import { GameCodeDisplay } from "./game-code-display.tsx";
import { PlayerList } from "./player-list.tsx";
import { QuestionCard } from "./question-card.tsx";
import { ScoreDelta } from "./score-delta.tsx";

const meta: Meta = {
  title: "Game/Game code and round",
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

export const GameCode: S = {
  render: () => (
    <GameCodeDisplay code={GAME_CODE} shareUrl="https://ejemplo.es/s/KQZT" />
  ),
};
export const GameCodeSixChars: S = {
  render: () => <GameCodeDisplay code="A7K2Q9" />,
};

const lobby = PLAYERS.slice(0, 6).map((p) => ({
  ...p,
  host: p.id === HOST.id,
}));
export const PlayersLobby: S = {
  render: () => <PlayerList players={lobby} youId={YOU.id} />,
};
const roundStatus = (index: number) => {
  if (index === 4) {
    return "disconnected" as const;
  }
  return index % 2 ? ("answered" as const) : ("waiting" as const);
};
export const PlayersRound: S = {
  render: () => (
    <PlayerList
      showAnswerStatus
      youId={YOU.id}
      players={PLAYERS.slice(0, 6).map((p, i) => ({
        ...p,
        host: p.id === HOST.id,
        status: roundStatus(i),
      }))}
    />
  ),
};
export const PlayersEmpty: S = { render: () => <PlayerList players={[]} /> };
export const PlayersRepeatedNames: S = {
  render: () => (
    <PlayerList
      youId="p-ana2"
      players={withDistinctNames([
        { id: "p-ana1", name: "Ana", host: true },
        { id: "p-ana2", name: "Ana" },
        { id: "p-x", name: "Pablo" },
        { id: "p-ana3", name: "ana" },
      ])}
    />
  ),
};
export const Answers: S = {
  render: () => (
    <AnswerTracker
      players={PLAYERS.slice(0, 12).map((p, i) => ({
        ...p,
        answered: i % 3 !== 0,
      }))}
    />
  ),
};
export const AnswersAll: S = {
  render: () => (
    <AnswerTracker
      players={PLAYERS.slice(0, 6).map((p) => ({ ...p, answered: true }))}
    />
  ),
};
export const Question: S = {
  render: () => (
    <QuestionCard question={QUESTIONS.wall.text} unit={QUESTIONS.wall.unit} />
  ),
};
export const QuestionLongUnit: S = {
  render: () => (
    <QuestionCard
      question={QUESTIONS.density.text}
      unit={QUESTIONS.density.unit}
    />
  ),
};
export const QuestionImpostor: S = {
  render: () => <QuestionCard impostor unit={QUESTIONS.wall.unit} />,
};

export const CountdownRing: S = {
  render: () => (
    <div className="flex items-center gap-6">
      <Countdown {...deadline(23)} duration={30} />
      <Countdown {...deadline(23)} duration={30} size="lg" />
    </div>
  ),
};
export const CountdownUrgent: S = {
  render: () => (
    <div className="flex items-center gap-6">
      <Countdown {...deadline(4.5)} duration={30} />
      <Countdown {...deadline(4.5)} duration={30} size="lg" />
    </div>
  ),
};
export const CountdownEnded: S = {
  render: () => (
    <div className="flex items-center gap-6">
      <Countdown {...deadline(0)} duration={30} />
      <Countdown {...deadline(0)} duration={30} size="lg" />
    </div>
  ),
};
export const CountdownBar: S = {
  render: () => (
    <Countdown
      variant="bar"
      label="Siguiente ronda en"
      {...deadline(8)}
      duration={10}
    />
  ),
};
/** Simulates a poll every second (new serverNow, same endsAt, a bit of network jitter): the ring keeps gliding. */
const Polled = () => {
  const [clock, setClock] = useState(() => deadline(30));
  useEffect(() => {
    const t = window.setInterval(
      () =>
        setClock((current) => ({
          ...current,
          serverNow: Date.now() + Math.round(Math.random() * 120 - 60),
        })),
      1000
    );
    return () => window.clearInterval(t);
  }, []);
  return (
    <Countdown
      endsAt={clock.endsAt}
      serverNow={clock.serverNow}
      duration={30}
      size="lg"
    />
  );
};
export const CountdownUnderPolling: S = { render: () => <Polled /> };

export const Deltas: S = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <ScoreDelta points={3} reason="closest" />
      <ScoreDelta points={2} reason="exact" />
      <ScoreDelta points={5} reason="impostor" />
      <ScoreDelta points={2} reason="caught" />
      <ScoreDelta points={0} />
      <ScoreDelta points={3} size="sm" />
    </div>
  ),
};
