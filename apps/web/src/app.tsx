import { routes as gamesRoutes } from "./features/games/routes.tsx";
import { routes as impostorRoutes } from "./features/impostor/routes.tsx";
import { routes as roundsRoutes } from "./features/rounds/routes.tsx";
import { routes as scoringRoutes } from "./features/scoring/routes.tsx";
import { Shell, createAppRouter } from "./shell/shell.tsx";

/** Every group's screens. Each feature owns its `routes.tsx`; the shell only mounts them. */
export const featureRoutes = [
  ...gamesRoutes,
  ...roundsRoutes,
  ...scoringRoutes,
  ...impostorRoutes,
];

const router = createAppRouter(featureRoutes);

export const App = () => <Shell router={router} />;
