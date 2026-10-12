import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { QUESTIONS } from "../stories/fixtures.ts";
import { EstimateRuler } from "./estimate-ruler.tsx";
import type { EstimateRulerProps } from "./estimate-ruler.tsx";

type Q = (typeof QUESTIONS)[keyof typeof QUESTIONS];
type DemoProps = Partial<EstimateRulerProps> & {
  q: Q;
  initial?: number | null;
};

/** Controlled wrapper: the ruler is always driven by state in the parent. */
const Demo = ({ q, initial = null, ...rest }: DemoProps) => {
  const [value, setValue] = useState<number | null>(initial);
  return (
    <div className="bg-surface text-ink flex h-[560px] w-[360px] flex-col p-4">
      <EstimateRuler
        min={q.min}
        max={q.max}
        unit={q.unit}
        step={q.step}
        value={value}
        onChange={setValue}
        {...rest}
      />
    </div>
  );
};

const meta: Meta<typeof Demo> = {
  title: "Game/EstimateRuler",
  component: Demo,
};
export default meta;
type S = StoryObj<typeof Demo>;

/** No estimate yet: the tape rests at the middle of the scale, the number reads "¿?" and Enviar stays disabled. */
export const Empty: S = { args: { q: QUESTIONS.percent } };
export const SetLinear: S = { args: { q: QUESTIONS.everest, initial: 6500 } };
/** 1–1.000.000.000 personas: auto picks log; full form big, readable form underneath. */
export const SetLog: S = { args: { q: QUESTIONS.iceland, initial: 1_200_000 } };
export const NegativeDecimals: S = {
  args: { q: QUESTIONS.coldest, initial: -42.5 },
};
export const LongUnit: S = { args: { q: QUESTIONS.density, initial: 12_500 } };
export const LongestNumber: S = {
  args: { q: QUESTIONS.iceland, initial: 1_000_000_000 },
};
/** Editable-until-deadline rule, value matches what the server has. */
export const SentEditable: S = {
  args: { q: QUESTIONS.everest, initial: 8000, sentValue: 8000 },
};
/** Editable rule after moving it again: "Sin enviar", and the bar's button becomes "Cambiar". */
export const ChangedAfterSending: S = {
  args: { q: QUESTIONS.everest, initial: 8200, sentValue: 8000 },
};
/** Locked-after-Enviar rule. */
export const SentLocked: S = {
  args: { q: QUESTIONS.everest, initial: 8000, sentValue: 8000, locked: true },
};
export const Disabled: S = {
  args: { q: QUESTIONS.everest, initial: 8000, disabled: true },
};
export const DisabledNoAnswer: S = {
  args: { q: QUESTIONS.everest, initial: null, disabled: true },
};
export const ForcedLinearOnHugeRange: S = {
  args: { q: QUESTIONS.iceland, initial: 383_000, scale: "linear" },
};
