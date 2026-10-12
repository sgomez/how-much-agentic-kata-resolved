import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Phone } from "../stories/helpers.tsx";
import { BottomSheet } from "./bottom-sheet.tsx";
import { Button } from "./button.tsx";
import { EmptyState } from "./empty-state.tsx";
import { Screen } from "./screen.tsx";
import { Skeleton } from "./skeleton.tsx";
import { Spinner } from "./spinner.tsx";
import { Toast } from "./toast.tsx";
import { Text } from "./typography.tsx";

const meta: Meta = { title: "Primitives/Feedback" };
export default meta;
type S = StoryObj;

export const Skeletons: S = {
  decorators: [
    (Story) => (
      <Phone>
        <Story />
      </Phone>
    ),
  ],
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Skeleton shape="circle" />
        <div className="flex-1">
          <Skeleton lines={2} />
        </div>
      </div>
      <Skeleton shape="block" height={120} />
    </div>
  ),
};
export const Spinners: S = {
  decorators: [
    (Story) => (
      <Phone>
        <Story />
      </Phone>
    ),
  ],
  render: () => (
    <div className="text-ink flex items-center gap-4">
      <Spinner />
      <Spinner size={32} />
      <span className="text-accent-text">
        <Spinner size={24} />
      </span>
    </div>
  ),
};
export const EmptyList: S = {
  decorators: [
    (Story) => (
      <Phone>
        <Story />
      </Phone>
    ),
  ],
  render: () => (
    <EmptyState
      icon="users"
      title="Aún no hay nadie"
      description="Comparte el código para que se unan tus compañeros."
    />
  ),
};
export const ErrorState: S = {
  decorators: [
    (Story) => (
      <Phone>
        <Story />
      </Phone>
    ),
  ],
  render: () => (
    <EmptyState
      icon="alert"
      tone="danger"
      title="Esa partida no existe"
      description="Revisa el código con quien la creó. Son 4 letras."
      action={<Button variant="secondary">Probar otro código</Button>}
    />
  ),
};
const ToastDemo = ({
  tone,
}: {
  tone: "info" | "success" | "warning" | "danger";
}) => {
  const [open, setOpen] = useState(true);
  const msg = {
    info: "Lucía es ahora la anfitriona",
    success: "Código copiado",
    warning: "Quedan 5 segundos",
    danger: "No se ha podido enviar. Reintentando…",
  }[tone];
  return (
    <div style={{ ["--screen-h" as string]: "360px" }}>
      <Screen
        overlays={
          <Toast
            open={open}
            tone={tone}
            message={msg}
            onClose={() => setOpen(false)}
            duration={0}
          />
        }
      >
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Mostrar aviso
        </Button>
      </Screen>
    </div>
  );
};
export const ToastInfo: S = { render: () => <ToastDemo tone="info" /> };
export const ToastSuccess: S = { render: () => <ToastDemo tone="success" /> };
export const ToastDanger: S = { render: () => <ToastDemo tone="danger" /> };
const SheetDemo = () => {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ ["--screen-h" as string]: "560px" }}>
      <Screen
        overlays={
          <BottomSheet
            open={open}
            onClose={() => setOpen(false)}
            title="¿Salir de la partida?"
            actions={
              <>
                <Button variant="danger" fullWidth size="lg">
                  Salir
                </Button>
                <Button
                  variant="ghost"
                  fullWidth
                  onClick={() => setOpen(false)}
                >
                  Seguir jugando
                </Button>
              </>
            }
          >
            <Text tone="muted">
              Si sales ahora, pierdes tus puntos de esta partida.
            </Text>
          </BottomSheet>
        }
      >
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Abrir hoja
        </Button>
      </Screen>
    </div>
  );
};
export const BottomSheetOpen: S = { render: () => <SheetDemo /> };
