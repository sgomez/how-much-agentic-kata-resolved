import type { Meta, StoryObj } from "@storybook/react-vite";

import { Phone } from "../stories/helpers.tsx";
import { Badge } from "./badge.tsx";
import { Card } from "./card.tsx";
import { Stack, Grid } from "./stack.tsx";
import { Heading, Text } from "./typography.tsx";

const meta: Meta = {
  title: "Primitives/Text and layout",
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

export const Headings: S = {
  render: () => (
    <Stack gap={3}>
      <Heading level={1} size="display">
        ¡Ganó Lucía!
      </Heading>
      <Heading level={1}>Ronda 3</Heading>
      <Heading level={2}>Jugadores</Heading>
      <Heading level={3}>Ajustes</Heading>
    </Stack>
  ),
};
export const TextTones: S = {
  render: () => (
    <Stack gap={2}>
      <Text size="lg">¿Cuántas personas viven en Islandia?</Text>
      <Text>Elige un apodo para jugar.</Text>
      <Text size="sm" tone="muted">
        7 de 12 han respondido
      </Text>
      <Text size="xs" tone="muted">
        ANFITRIÓN
      </Text>
      <Text size="sm" tone="success" weight="bold">
        ✓ Enviado
      </Text>
      <Text size="sm" tone="danger" weight="bold">
        Ese código no existe
      </Text>
      <Text size="sm" tone="accent" weight="bold">
        Eres el impostor
      </Text>
    </Stack>
  ),
};
export const StackAndGrid: S = {
  render: () => (
    <Stack gap={6}>
      <Stack direction="row" gap={2} wrap>
        <Badge>uno</Badge>
        <Badge>dos</Badge>
        <Badge>tres</Badge>
      </Stack>
      <Grid cols={2}>
        <Card>A</Card>
        <Card>B</Card>
        <Card>C</Card>
        <Card>D</Card>
      </Grid>
    </Stack>
  ),
};
export const Cards: S = {
  render: () => (
    <Stack gap={4}>
      <Card>
        <Text>Raised: la tarjeta por defecto.</Text>
      </Card>
      <Card tone="sunken">
        <Text>Sunken: información de solo lectura.</Text>
      </Card>
      <Card tone="primary">
        <Text weight="bold">Primary: lo que importa ahora.</Text>
      </Card>
      <Card tone="accent">
        <Text weight="bold" className="text-on-accent">
          Accent: celebración o impostor.
        </Text>
      </Card>
    </Stack>
  ),
};
