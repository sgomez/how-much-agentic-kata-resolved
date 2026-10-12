import type { Meta, StoryObj } from "@storybook/react-vite";

import { Frames, PhoneFrame } from "../stories/helpers.tsx";
import { FinalScreen } from "./screens.tsx";

const meta: Meta = { title: "Patterns/10 Final ranking" };
export default meta;
type S = StoryObj;

export const Final: S = {
  render: () => (
    <Frames>
      <PhoneFrame label="Anfitrión" note="«Jugar otra vez»">
        <FinalScreen viewer="host" />
      </PhoneFrame>
      <PhoneFrame label="Jugador" note="Espera a que el anfitrión decida">
        <FinalScreen viewer="player" />
      </PhoneFrame>
    </Frames>
  ),
};
