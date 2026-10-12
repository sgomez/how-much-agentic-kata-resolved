import type { Meta, StoryObj } from "@storybook/react-vite";

import { Phone } from "../stories/helpers.tsx";
import { Button } from "./button.tsx";
import { IconButton } from "./icon-button.tsx";

const meta: Meta<typeof Button> = {
  title: "Primitives/Button",
  component: Button,
  decorators: [
    (Story) => (
      <Phone>
        <div className="flex flex-col items-start gap-3">
          <Story />
        </div>
      </Phone>
    ),
  ],
  args: { children: "Enviar" },
};
export default meta;
type S = StoryObj<typeof Button>;

export const Primary: S = {};
export const Secondary: S = {
  args: { variant: "secondary", children: "Unirme con código" },
};
export const Ghost: S = { args: { variant: "ghost", children: "Ahora no" } };
export const Danger: S = {
  args: { variant: "danger", children: "Salir de la partida", icon: "log-out" },
};
export const WithIcon: S = { args: { icon: "send", children: "Enviar" } };
export const LargeFullWidth: S = {
  decorators: [
    (Story) => (
      <div className="w-full">
        <Story />
      </div>
    ),
  ],
  args: { size: "lg", fullWidth: true, icon: "play", children: "Empezar" },
};
export const Loading: S = {
  args: {
    loading: true,
    size: "lg",
    fullWidth: true,
    children: "Creando partida…",
  },
};
export const Disabled: S = {
  args: { disabled: true, size: "lg", fullWidth: true, children: "Empezar" },
};
export const Focused: S = {
  args: { autoFocus: true, children: "Con foco (teclado)" },
};
/** What a press looks like: the sticker sinks into its shadow. Forced here for the record. */
export const Pressed: S = {
  args: { className: "translate-y-1! shadow-none!", children: "Pulsado" },
};
export const IconButtons: S = {
  render: () => (
    <div className="flex gap-3">
      <IconButton icon="copy" label="Copiar código" />
      <IconButton icon="share" label="Compartir" variant="primary" />
      <IconButton icon="close" label="Cerrar" variant="ghost" />
      <IconButton icon="plus" label="Más" disabled />
      <IconButton icon="plus" label="Más" size="lg" />
    </div>
  ),
};
