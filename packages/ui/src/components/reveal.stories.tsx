import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  byId,
  ICELAND_ESTIMATES,
  player,
  QUESTIONS,
  YOU,
} from "../stories/fixtures.ts";
import { Phone } from "../stories/helpers.tsx";
import { RevealList } from "./reveal-list.tsx";
import { RevealRuler, closestIds } from "./reveal-ruler.tsx";
import type { RevealEstimate } from "./reveal-ruler.tsx";

const meta: Meta = {
  title: "Game/Reveal",
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

const q = QUESTIONS.everest;
const few: RevealEstimate[] = [
  { player: player(0), value: 8500 },
  { player: player(1), value: 6000 },
  { player: player(2), value: 8848 - 300 },
  { player: player(3), value: 7400 },
  { player: player(4), value: null },
];
export const RulerLinear: S = {
  render: () => (
    <RevealRuler
      min={q.min}
      max={q.max}
      unit={q.unit}
      solution={q.solution}
      estimates={few}
    />
  ),
};

const ice = QUESTIONS.iceland;
const crowd: RevealEstimate[] = ICELAND_ESTIMATES.map(([id, value]) => ({
  player: byId(id),
  value,
}));
/** 20 players, many close together: avatars step sideways, the lane overflow becomes "+N". */
export const RulerLogCrowded: S = {
  render: () => (
    <RevealRuler
      min={ice.min}
      max={ice.max}
      unit={ice.unit}
      solution={ice.solution}
      estimates={crowd}
      height={380}
    />
  ),
};

const withImp: RevealEstimate[] = [
  ...few.slice(0, 4),
  { player: player(5), value: 8700, excluded: true },
];
/** Impostor's estimate shown but not competing: dashed and never "Más cerca". */
export const RulerImpostorApart: S = {
  render: () => (
    <RevealRuler
      min={q.min}
      max={q.max}
      unit={q.unit}
      solution={q.solution}
      estimates={withImp}
    />
  ),
};

const exact: RevealEstimate[] = [
  { player: player(0), value: 71 },
  { player: player(1), value: 65 },
  { player: player(2), value: 80 },
];
export const RulerExactHit: S = {
  render: () => (
    <RevealRuler
      min={0}
      max={100}
      unit="%"
      solution={71}
      estimates={exact}
      height={280}
    />
  ),
};

const tie: RevealEstimate[] = [
  { player: player(0), value: 60 },
  { player: player(1), value: 82 },
  { player: player(2), value: 40 },
];
export const RulerTie: S = {
  render: () => (
    <RevealRuler
      min={0}
      max={100}
      unit="%"
      solution={71}
      estimates={tie}
      height={280}
    />
  ),
};

const pointsFor = (e: RevealEstimate, sol: number, win: Set<string>) => {
  if (e.value === null || !win.has(e.player.id)) {
    return 0;
  }
  return e.value === sol ? 5 : 3;
};
const reasonFor = (e: RevealEstimate, sol: number, win: Set<string>) => {
  if (!win.has(e.player.id)) {
    return;
  }
  return e.value === sol ? ("exact" as const) : ("closest" as const);
};
const listEntries = (est: RevealEstimate[], sol: number) => {
  const win = closestIds(est, sol);
  return est.map((e) => ({
    ...e,
    points: pointsFor(e, sol, win),
    reason: reasonFor(e, sol, win),
  }));
};
export const List: S = {
  render: () => (
    <RevealList
      unit={q.unit}
      solution={q.solution}
      entries={listEntries(few, q.solution)}
      youId={YOU.id}
    />
  ),
};
export const ListImpostorApart: S = {
  render: () => (
    <RevealList
      unit={q.unit}
      solution={q.solution}
      entries={listEntries(withImp, q.solution)}
      youId={YOU.id}
    />
  ),
};
export const ListExact: S = {
  render: () => (
    <RevealList unit="%" solution={71} entries={listEntries(exact, 71)} />
  ),
};
