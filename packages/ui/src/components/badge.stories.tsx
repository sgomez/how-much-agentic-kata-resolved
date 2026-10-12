import type { Meta, StoryObj } from "@storybook/react-vite";

import { Phone } from "../stories/helpers.tsx";
import { Badge } from "./badge.tsx";

const meta: Meta<typeof Badge> = {
  title: "Primitives/Badge",
  component: Badge,
  decorators: [
    (Story) => (
      <Phone>
        <Story />
      </Phone>
    ),
  ],
};
export default meta;
type S = StoryObj<typeof Badge>;

export const Soft: S = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge>Esperando</Badge>
      <Badge tone="primary" icon="crown">
        Anfitrión
      </Badge>
      <Badge tone="accent" icon="mask">
        Impostor
      </Badge>
      <Badge tone="success" icon="check">
        Ha respondido
      </Badge>
      <Badge tone="warning" icon="pencil">
        Sin enviar
      </Badge>
      <Badge tone="danger" icon="wifi-off">
        Desconectado
      </Badge>
      <Badge tone="info" icon="info">
        Nuevo
      </Badge>
    </div>
  ),
};
export const Solid: S = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="solid">Tú</Badge>
      <Badge variant="solid" tone="primary" icon="target">
        Más cerca
      </Badge>
      <Badge variant="solid" tone="success" icon="check">
        Enviado
      </Badge>
      <Badge variant="solid" tone="danger" icon="clock">
        ¡Tiempo!
      </Badge>
    </div>
  ),
};
