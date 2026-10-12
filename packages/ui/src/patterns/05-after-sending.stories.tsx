import type { Meta, StoryObj } from "@storybook/react-vite";

import { Frames, PhoneFrame } from "../stories/helpers.tsx";
import { RoundScreen, WaitingScreen } from "./screens.tsx";

const meta: Meta = { title: "Patterns/05 After sending" };
export default meta;
type S = StoryObj;

/** Open decision: can a player change their estimate after sending it? */
export const EditRule: S = {
  render: () => (
    <Frames>
      <PhoneFrame
        label="Decisión · cambiar tras enviar"
        note="A: bloqueada tras «Enviar»"
      >
        <RoundScreen initial={21_000} sent={21_000} editRule="locked" />
      </PhoneFrame>
      <PhoneFrame
        label="Decisión · cambiar tras enviar"
        note="B: editable — enviada y sin cambios"
      >
        <RoundScreen initial={21_000} sent={21_000} editRule="editable" />
      </PhoneFrame>
      <PhoneFrame
        label="Decisión · cambiar tras enviar"
        note="B: editable — movida: «Enviar» pasa a «Cambiar»"
      >
        <RoundScreen initial={23_500} sent={21_000} editRule="editable" />
      </PhoneFrame>
    </Frames>
  ),
};
export const Waiting: S = {
  render: () => (
    <Frames>
      <PhoneFrame
        label="Esperando al resto"
        note="Quién ha respondido, nunca qué"
      >
        <WaitingScreen />
      </PhoneFrame>
      <PhoneFrame
        label="Esperando · editable"
        note="Con la regla B, un acceso para volver a cambiarla"
      >
        <WaitingScreen editRule="editable" />
      </PhoneFrame>
      <PhoneFrame
        label="Todos han respondido"
        note="Con la regla A de fin de ronda"
      >
        <WaitingScreen everyoneIn />
      </PhoneFrame>
    </Frames>
  ),
};
/** A player does not answer in time. */
export const TimeUp: S = {
  render: () => (
    <Frames>
      <PhoneFrame
        label="Se acabó el tiempo · con estimación sin enviar"
        note="Lo no enviado no cuenta"
      >
        <RoundScreen initial={21_000} timeUp answered={11} />
      </PhoneFrame>
      <PhoneFrame
        label="Se acabó el tiempo · sin estimación"
        note="Saldrá «Sin respuesta» en la revelación"
      >
        <RoundScreen timeUp answered={11} />
      </PhoneFrame>
    </Frames>
  ),
};
