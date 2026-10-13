import type { RouteObject } from "react-router";
import { useParams } from "react-router";

import { ScoreboardScreen } from "./scoreboard-screen.tsx";

const ScoreboardRoute = () => {
  const { code } = useParams<{ code?: string }>();
  return <ScoreboardScreen gameCode={code ?? ""} />;
};

export const routes: RouteObject[] = [
  {
    path: "/scoreboard",
    element: <ScoreboardRoute />,
  },
  {
    path: "/scoreboard/:code",
    element: <ScoreboardRoute />,
  },
];
