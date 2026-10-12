import type { Meta, StoryObj } from "@storybook/react-vite";

import { QUESTIONS } from "../stories/fixtures.ts";
import { Frames, PhoneFrame } from "../stories/helpers.tsx";
import { RoundScreen, LateJoinScreen, ErrorScreen } from "./screens.tsx";

const meta: Meta = { title: "Patterns/04 Round" };
export default meta;
type S = StoryObj;

export const PlayerAndImpostor: S = {
  render: () => (
    <Frames>
      <PhoneFrame
        label="Jugador · sin estimación"
        note="La regla en el centro, «¿?» y «Enviar» desactivado"
      >
        <RoundScreen />
      </PhoneFrame>
      <PhoneFrame label="Jugador · estimación elegida">
        <RoundScreen initial={21_000} />
      </PhoneFrame>
      <PhoneFrame
        label="Impostor"
        note="Solo la unidad; misma tarjeta para no delatarse"
      >
        <RoundScreen impostor initial={15_000} />
      </PhoneFrame>
      <PhoneFrame
        label="Anfitrión"
        note="Juega igual que los demás: misma pantalla"
      >
        <RoundScreen initial={9000} answered={11} />
      </PhoneFrame>
    </Frames>
  ),
};
export const OtherScales: S = {
  render: () => (
    <Frames>
      <PhoneFrame label="0–100 %">
        <RoundScreen q={QUESTIONS.percent} initial={64} />
      </PhoneFrame>
      <PhoneFrame label="1–1.000.000.000 personas (log)">
        <RoundScreen q={QUESTIONS.iceland} initial={1_200_000} />
      </PhoneFrame>
      <PhoneFrame label="−90–60 °C, paso 0,5">
        <RoundScreen q={QUESTIONS.coldest} initial={-57.5} />
      </PhoneFrame>
      <PhoneFrame label="Últimos 5 s" note="Cuenta atrás urgente">
        <RoundScreen initial={21_000} secondsLeft={4.5} answered={10} />
      </PhoneFrame>
    </Frames>
  ),
};
/** Open decision: does a round end early when everyone has answered? */
export const EndsEarly: S = {
  render: () => (
    <Frames>
      <PhoneFrame
        label="Decisión · fin de ronda"
        note="A: solo al acabar el tiempo — sigue la cuenta"
      >
        <RoundScreen initial={21_000} sent={21_000} answered={12} />
      </PhoneFrame>
      <PhoneFrame
        label="Decisión · fin de ronda"
        note="B: en cuanto respondáis todos — se avisa antes"
      >
        <RoundScreen initial={21_000} answered={11} endsEarlyNote />
      </PhoneFrame>
    </Frames>
  ),
};
/** Open decision: joining once the game has started. */
export const LateJoin: S = {
  render: () => (
    <Frames>
      <PhoneFrame
        label="Decisión · unirse empezada"
        note="A: rechazado con error"
      >
        <ErrorScreen kind="started" />
      </PhoneFrame>
      <PhoneFrame
        label="Decisión · unirse empezada"
        note="B: permitido, entra en la siguiente ronda"
      >
        <LateJoinScreen />
      </PhoneFrame>
    </Frames>
  ),
};
