import { BottomActionBar, Button, EmptyState, Screen } from "@hmk/ui";
import { useNavigate } from "react-router";

export const NotFoundPage = () => {
  const navigate = useNavigate();
  return (
    <Screen
      centered
      bottom={
        <BottomActionBar>
          <Button
            size="lg"
            fullWidth
            icon="chevron-left"
            onClick={() => navigate("/")}
          >
            Volver al inicio
          </Button>
        </BottomActionBar>
      }
    >
      <EmptyState
        icon="question"
        title="Aquí no hay nada"
        description="Esta página no existe. Vuelve al inicio y elige otra."
      />
    </Screen>
  );
};
