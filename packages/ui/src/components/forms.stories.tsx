import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Phone } from "../stories/helpers.tsx";
import { ChipGroup } from "./chip-group.tsx";
import { CodeInput } from "./code-input.tsx";
import type { CodeAlphabet } from "./code-input.tsx";
import { DetailList } from "./detail-list.tsx";
import { Input } from "./input.tsx";
import { SegmentedControl } from "./segmented-control.tsx";
import { Stepper } from "./stepper.tsx";
import { Switch } from "./switch.tsx";

const meta: Meta = {
  title: "Primitives/Forms",
  decorators: [
    (Story) => (
      <Phone>
        <Story />
      </Phone>
    ),
  ],
};
export default meta;
type S = StoryObj;

const InputDemo = ({
  initial = "",
  error,
  disabled,
}: {
  initial?: string;
  error?: string;
  disabled?: boolean;
}) => {
  const [v, setV] = useState(initial);
  return (
    <Input
      label="Tu apodo"
      value={v}
      onChange={setV}
      hint="Así te verán los demás"
      maxLength={16}
      error={error}
      disabled={disabled}
      placeholder="p. ej. Lucía"
    />
  );
};
export const InputEmpty: S = { render: () => <InputDemo /> };
export const InputFilled: S = { render: () => <InputDemo initial="Mario" /> };
export const InputError: S = {
  render: () => (
    <InputDemo
      initial="Lucía"
      error="Ya hay una Lucía en la partida. Prueba con otro."
    />
  ),
};
export const InputDisabled: S = {
  render: () => <InputDemo initial="Mario" disabled />,
};

const CodeDemo = ({
  initial = "",
  length = 4,
  alphabet = "letters" as CodeAlphabet,
  error,
  disabled,
}: {
  initial?: string;
  length?: number;
  alphabet?: CodeAlphabet;
  error?: string;
  disabled?: boolean;
}) => {
  const [v, setV] = useState(initial);
  return (
    <CodeInput
      value={v}
      onChange={setV}
      length={length}
      alphabet={alphabet}
      error={error}
      disabled={disabled}
    />
  );
};
export const CodeEmpty: S = { render: () => <CodeDemo /> };
export const CodePartial: S = { render: () => <CodeDemo initial="KQ" /> };
export const CodeComplete: S = { render: () => <CodeDemo initial="KQZT" /> };
export const CodeError: S = {
  render: () => (
    <CodeDemo initial="KQZX" error="No hay ninguna partida con ese código" />
  ),
};
export const CodeSixAlphanumeric: S = {
  render: () => <CodeDemo initial="A7K" length={6} alphabet="alphanumeric" />,
};
export const CodeDigits: S = {
  render: () => <CodeDemo initial="40" length={4} alphabet="digits" />,
};
export const CodeDisabled: S = {
  render: () => <CodeDemo initial="KQZT" disabled />,
};

const SettingsDemo = ({ disabled }: { disabled?: boolean }) => {
  const [rounds, setRounds] = useState(10);
  const [secs, setSecs] = useState(30);
  const [imp, setImp] = useState(true);
  const [packs, setPacks] = useState(["geo", "ciencia"]);
  const [order, setOrder] = useState<"host" | "auto">("host");
  return (
    <div className="flex flex-col gap-5">
      <Stepper
        label="Rondas"
        value={rounds}
        onChange={setRounds}
        min={1}
        max={20}
        disabled={disabled}
      />
      <Stepper
        label="Segundos por ronda"
        value={secs}
        onChange={setSecs}
        min={10}
        max={90}
        step={5}
        unit="s"
        disabled={disabled}
      />
      <Switch
        label="Modo impostor"
        description="Cada ronda, alguien no verá la pregunta"
        checked={imp}
        onChange={setImp}
        disabled={disabled}
      />
      <ChipGroup
        label="Paquetes de preguntas"
        options={[
          { value: "geo", label: "Geografía" },
          { value: "ciencia", label: "Ciencia" },
          { value: "historia", label: "Historia" },
          { value: "deporte", label: "Deporte" },
          { value: "cine", label: "Cine y series" },
          { value: "friki", label: "Informática" },
        ]}
        value={packs}
        onChange={setPacks}
        disabled={disabled}
      />
      <SegmentedControl
        label="Siguiente ronda"
        options={[
          { value: "host", label: "La pasa el anfitrión" },
          { value: "auto", label: "Automática" },
        ]}
        value={order}
        onChange={setOrder}
        disabled={disabled}
      />
    </div>
  );
};
export const SettingsEditable: S = { render: () => <SettingsDemo /> };
export const SettingsDisabled: S = { render: () => <SettingsDemo disabled /> };
export const SettingsReadOnly: S = {
  render: () => (
    <DetailList
      title="Ajustes de la partida"
      items={[
        { label: "Rondas", value: "10", icon: "flag" },
        { label: "Segundos por ronda", value: "30 s", icon: "clock" },
        { label: "Modo impostor", value: "Sí", icon: "mask" },
        { label: "Paquetes", value: "Geografía, Ciencia", icon: "ruler" },
      ]}
    />
  ),
};
