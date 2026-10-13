import type { RouteObject } from "react-router";

import { GamePage } from "./game-page.tsx";
import { GamesHomePage } from "./home-page.tsx";

/**
 * Screens of the games group. The shell mounts them behind the nickname sign-in.
 * Build screens only with @hmk/ui (see packages/ui/COMPONENTS.md; the Patterns/
 * stories in `pnpm storybook` show each screen put together), fetch views with
 * `useView` and send actions with `api` from src/shell.
 */
export const routes: RouteObject[] = [
  { path: "/", element: <GamesHomePage /> },
  { path: "/games/:code", element: <GamePage /> },
];
