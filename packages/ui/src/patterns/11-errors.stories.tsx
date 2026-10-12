import type { Meta, StoryObj } from "@storybook/react-vite";

import { Frames, PhoneFrame } from "../stories/helpers.tsx";
import { ErrorScreen, RoundScreen } from "./screens.tsx";

const meta: Meta = { title: "Patterns/11 Errors" };
export default meta;
type S = StoryObj;

export const JoinErrors: S = {
  render: () => (
    <Frames>
      <PhoneFrame
        label="Código desconocido"
        note="En la propia pantalla de inicio"
      >
        <ErrorScreen kind="unknown" />
      </PhoneFrame>
      <PhoneFrame label="La partida ya ha empezado">
        <ErrorScreen kind="started" />
      </PhoneFrame>
      <PhoneFrame label="Partida llena">
        <ErrorScreen kind="full" />
      </PhoneFrame>
      <PhoneFrame label="Partida cerrada">
        <ErrorScreen kind="closed" />
      </PhoneFrame>
    </Frames>
  ),
};
export const ConnectionLost: S = {
  render: () => (
    <Frames>
      <PhoneFrame
        label="Conexión perdida"
        note="Aviso tranquilo; la regla sigue funcionando"
      >
        <RoundScreen initial={21_000} connection="reconnecting" />
      </PhoneFrame>
      <PhoneFrame
        label="Reconectado"
        note="Alterna cada 3 s: «Conectado» dura 2 s; recuperas tu estado"
      >
        <RoundScreen initial={21_000} sent={21_000} connection="recovering" />
      </PhoneFrame>
    </Frames>
  ),
};
