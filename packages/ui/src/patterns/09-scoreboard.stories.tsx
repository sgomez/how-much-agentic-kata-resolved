import type { Meta, StoryObj } from "@storybook/react-vite";

import { Frames, PhoneFrame } from "../stories/helpers.tsx";
import { ScoreboardScreen } from "./screens.tsx";

const meta: Meta = {
  title: "Patterns/09 Scoreboard",
  tags: ["games", "scoring"],
};
export default meta;
type S = StoryObj;

/** Open decision: when the scoreboard appears. */
export const WhenItAppears: S = {
  render: () => (
    <Frames>
      <PhoneFrame
        label="Decisión · cuándo hay marcador"
        note="A: tras cada ronda (anfitrión)"
      >
        <ScoreboardScreen />
      </PhoneFrame>
      <PhoneFrame
        label="Decisión · cuándo hay marcador"
        note="A: tras cada ronda, paso automático"
      >
        <ScoreboardScreen viewer="player" advance="auto" />
      </PhoneFrame>
      <PhoneFrame
        label="Decisión · cuándo hay marcador"
        note="B: solo al final — cierre de ronda sin tabla"
      >
        <ScoreboardScreen when="end" viewer="player" />
      </PhoneFrame>
    </Frames>
  ),
};
