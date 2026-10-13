import type { RouteObject } from "react-router";
import { useParams } from "react-router";

import { RoundScreen } from "./round-screen.tsx";

const RoundRoute = () => {
  const { code } = useParams();
  return <RoundScreen gameCode={code ?? "DEMO"} />;
};

/**
 * Screens of the rounds group. Mounted behind the nickname sign-in.
 */
export const routes: RouteObject[] = [
  { path: "/round", element: <RoundRoute /> },
  { path: "/round/:code", element: <RoundRoute /> },
];
