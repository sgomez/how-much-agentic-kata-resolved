import { Button, EmptyState, Screen } from "@hmk/ui";

const messages: Record<string, { title: string; description: string }> = {
  "unknown-code": {
    description: "Revisa el código y vuelve a probar.",
    title: "Esa partida no existe",
  },
  "game-already-started": {
    description: "Pídele al anfitrión que cree otra partida.",
    title: "La partida ya ha empezado",
  },
  "nickname-taken": {
    description: "Otro jugador de la partida se llama igual que tú.",
    title: "Ese apodo ya está en uso",
  },
};

/** Errors (11): why joining failed, with a way back to the Home screen. */
export const JoinErrorScreen = ({
  code,
  onBack,
}: {
  code: string;
  onBack: () => void;
}) => {
  const message = messages[code] ?? {
    description: "Inténtalo de nuevo.",
    title: "No te has podido unir",
  };
  return (
    <Screen centered>
      <EmptyState
        icon="alert"
        tone="danger"
        {...message}
        action={<Button onClick={onBack}>Volver</Button>}
      />
    </Screen>
  );
};
