import type { Meta, StoryObj } from "@storybook/react-vite";

import { Frames, PhoneFrame } from "../stories/helpers.tsx";
import { VerdictScreen } from "./screens.tsx";

const meta: Meta = {
  title: "Patterns/08 Verdict",
  tags: ["games", "impostor", "scoring"],
};
export default meta;
type S = StoryObj;

/** Open decision: what the verdict shows. */
export const WhatItShows: S = {
  render: () => (
    <Frames>
      <PhoneFrame label="Decisión · qué muestra" note="A: solo si le pillaron">
        <VerdictScreen outcome="caught" />
      </PhoneFrame>
      <PhoneFrame
        label="Decisión · qué muestra"
        note="B: también quién votó a quién"
      >
        <VerdictScreen outcome="caught" showVotes />
      </PhoneFrame>
      <PhoneFrame label="No le pillaron" note="+5 para el impostor">
        <VerdictScreen outcome="escaped" showVotes />
      </PhoneFrame>
    </Frames>
  ),
};
/** Open decision: tie in the impostor vote. */
export const Tie: S = {
  render: () => (
    <Frames>
      <PhoneFrame
        label="Decisión · empate en la votación"
        note="A: cuenta como pillado"
      >
        <VerdictScreen
          outcome="caught"
          detail="Empate a 2 votos: cuenta como pillado"
        />
      </PhoneFrame>
      <PhoneFrame
        label="Decisión · empate en la votación"
        note="B: cuenta como no pillado"
      >
        <VerdictScreen outcome="escaped" detail="Empate a 2 votos: se libra" />
      </PhoneFrame>
      <PhoneFrame
        label="Decisión · empate en la votación"
        note="C: sin veredicto"
      >
        <VerdictScreen outcome="none" detail="Empate a 2 votos" />
      </PhoneFrame>
    </Frames>
  ),
};
/** Open decision: do the others score when they catch the impostor? */
export const CatchersScore: S = {
  render: () => (
    <Frames>
      <PhoneFrame label="Decisión · puntos por pillarle" note="A: no">
        <VerdictScreen outcome="caught" />
      </PhoneFrame>
      <PhoneFrame
        label="Decisión · puntos por pillarle"
        note="B: sí, cada uno con su ScoreDelta"
      >
        <VerdictScreen outcome="caught" catchersScore />
      </PhoneFrame>
    </Frames>
  ),
};
