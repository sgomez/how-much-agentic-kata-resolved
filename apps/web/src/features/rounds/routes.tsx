import type { RouteObject } from "react-router";

import { PlaceholderPage } from "../../shell/placeholder-page.tsx";

/**
 * Screens of the rounds group. Add your routes here; the shell mounts them behind
 * the nickname sign-in. Build screens only with @hmk/ui (see packages/ui/COMPONENTS.md;
 * the Patterns/ stories in `pnpm storybook` show each screen put together),
 * fetch views with `useView` and send actions with `api` from src/shell.
 */
export const routes: RouteObject[] = [
  { path: "/round", element: <PlaceholderPage title="Ronda" group="rounds" /> },
];
