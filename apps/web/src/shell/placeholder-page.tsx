import { EmptyState, IconButton, Screen, TopBar } from "@hmk/ui";
import { useNavigate } from "react-router";

/** A screen a group has not built yet. Replace it with the real one. */
export const PlaceholderPage = ({
  title,
  group,
}: {
  title: string;
  group: string;
}) => {
  const navigate = useNavigate();
  return (
    <Screen
      centered
      top={
        <TopBar
          leading={
            <IconButton
              icon="chevron-left"
              label="Volver al inicio"
              variant="ghost"
              onClick={() => navigate("/")}
            />
          }
        />
      }
    >
      <EmptyState
        icon="ruler"
        title={title}
        description={`Esta pantalla la construye el grupo «${group}».`}
      />
    </Screen>
  );
};
