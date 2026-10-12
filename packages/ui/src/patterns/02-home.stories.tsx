import type { Meta, StoryObj } from "@storybook/react-vite";

import { Frames, PhoneFrame } from "../stories/helpers.tsx";
import { HomeScreen } from "./screens.tsx";

const meta: Meta = { title: "Patterns/02 Home", tags: ["games"] };
export default meta;
type S = StoryObj;

export const CreateOrJoin: S = {
  render: () => (
    <Frames>
      <PhoneFrame label="Inicio">
        <HomeScreen />
      </PhoneFrame>
      <PhoneFrame
        label="Código escrito"
        note="«Unirme» se activa con el código completo"
      >
        <HomeScreen code="KQZT" />
      </PhoneFrame>
      <PhoneFrame label="Uniéndose">
        <HomeScreen code="KQZT" joining />
      </PhoneFrame>
    </Frames>
  ),
};
/** Open decision: game code format. CodeInput takes length and alphabet as props. */
export const CodeFormat: S = {
  render: () => (
    <Frames>
      <PhoneFrame label="Decisión · formato del código" note="A: 4 letras">
        <HomeScreen code="KQ" />
      </PhoneFrame>
      <PhoneFrame
        label="Decisión · formato del código"
        note="B: 6 letras o números"
      >
        <HomeScreen code="A7K2" codeLength={6} alphabet="alphanumeric" />
      </PhoneFrame>
      <PhoneFrame label="Decisión · formato del código" note="C: 4 números">
        <HomeScreen code="40" alphabet="digits" />
      </PhoneFrame>
    </Frames>
  ),
};
