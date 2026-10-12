import type { Meta, StoryObj } from "@storybook/react-vite";

import { Frames, PhoneFrame } from "../stories/helpers.tsx";
import { RevealScreen } from "./screens.tsx";

const meta: Meta = {
  title: "Patterns/06 Reveal",
  tags: ["games", "rounds", "scoring"],
};
export default meta;
type S = StoryObj;

/** Open decision: who moves to the next round. */
export const NextRound: S = {
  render: () => (
    <Frames>
      <PhoneFrame
        label="Decisión · siguiente ronda"
        note="A: el anfitrión, con botón"
      >
        <RevealScreen viewer="host" />
      </PhoneFrame>
      <PhoneFrame
        label="Decisión · siguiente ronda"
        note="A: lo que ve un jugador"
      >
        <RevealScreen viewer="player" />
      </PhoneFrame>
      <PhoneFrame
        label="Decisión · siguiente ronda"
        note="B: automática, con cuenta atrás visible"
      >
        <RevealScreen viewer="player" advance="auto" />
      </PhoneFrame>
    </Frames>
  ),
};
/** Open decision: does the impostor's estimate compete for points? */
export const ImpostorEstimate: S = {
  tags: ["impostor"],
  render: () => (
    <Frames>
      <PhoneFrame
        label="Decisión · estimación del impostor"
        note="A: compite como las demás (Álex)"
      >
        <RevealScreen viewer="host" impostorEstimate="competes" />
      </PhoneFrame>
      <PhoneFrame
        label="Decisión · estimación del impostor"
        note="B: se muestra aparte, sin competir"
      >
        <RevealScreen viewer="host" impostorEstimate="apart" />
      </PhoneFrame>
      <PhoneFrame label="Decisión · estimación del impostor" note="C: oculta">
        <RevealScreen viewer="host" impostorEstimate="hidden" />
      </PhoneFrame>
    </Frames>
  ),
};
export const NoAnswer: S = {
  render: () => (
    <Frames>
      <PhoneFrame
        label="Tú no respondiste a tiempo"
        note="«Sin respuesta» en la lista y bajo la regla"
      >
        <RevealScreen viewer="player" missing />
      </PhoneFrame>
    </Frames>
  ),
};
