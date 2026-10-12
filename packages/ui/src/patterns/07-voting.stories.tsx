import type { Meta, StoryObj } from "@storybook/react-vite";

import { Frames, PhoneFrame } from "../stories/helpers.tsx";
import { VotingScreen } from "./screens.tsx";

const meta: Meta = { title: "Patterns/07 Voting", tags: ["games", "impostor"] };
export default meta;
type S = StoryObj;

/** Open decision: can a vote change? */
export const VoteChange: S = {
  render: () => (
    <Frames>
      <PhoneFrame label="Eligiendo">
        <VotingScreen />
      </PhoneFrame>
      <PhoneFrame
        label="Decisión · cambiar el voto"
        note="A: definitivo una vez emitido"
      >
        <VotingScreen state="voted" rule="final" />
      </PhoneFrame>
      <PhoneFrame
        label="Decisión · cambiar el voto"
        note="B: se puede cambiar hasta el cierre"
      >
        <VotingScreen state="voted" rule="changeable" />
      </PhoneFrame>
    </Frames>
  ),
};
/** Open decision: can you vote for yourself, and does the impostor vote? */
export const SelfAndImpostor: S = {
  render: () => (
    <Frames>
      <PhoneFrame
        label="Decisión · votarse / vota el impostor"
        note="A: ambos permitidos — tu ficha es votable"
      >
        <VotingScreen selfVote="allowed" />
      </PhoneFrame>
      <PhoneFrame
        label="Decisión · votarse / vota el impostor"
        note="B: prohibido — tu ficha, desactivada"
      >
        <VotingScreen selfVote="forbidden" />
      </PhoneFrame>
      <PhoneFrame
        label="Decisión · votarse / vota el impostor"
        note="B: el impostor no vota"
      >
        <VotingScreen selfVote="forbidden" youAreImpostor />
      </PhoneFrame>
    </Frames>
  ),
};
