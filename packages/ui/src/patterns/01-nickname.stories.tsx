import type { Meta, StoryObj } from "@storybook/react-vite";

import { Frames, PhoneFrame } from "../stories/helpers.tsx";
import { NicknameScreen } from "./screens.tsx";

const meta: Meta = { title: "Patterns/01 Nickname" };
export default meta;
type S = StoryObj;

export const FirstVisit: S = {
  render: () => (
    <Frames>
      <PhoneFrame label="Vacío" note="«Seguir» desactivado hasta escribir algo">
        <NicknameScreen />
      </PhoneFrame>
      <PhoneFrame label="Escrito">
        <NicknameScreen initial="Mario" />
      </PhoneFrame>
      <PhoneFrame label="Entrando" note="Botón en carga, sin saltos de ancho">
        <NicknameScreen initial="Mario" loading />
      </PhoneFrame>
    </Frames>
  ),
};
