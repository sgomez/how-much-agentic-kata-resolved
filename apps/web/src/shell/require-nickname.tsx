import { Screen, Spinner, Stack } from "@hmk/ui";
import { Navigate, Outlet, useLocation } from "react-router";

import { authClient } from "./auth-client.ts";

/** Sends players without a session to pick a nickname, then back to where they were going. */
export const RequireNickname = () => {
  const { data: session, isPending } = authClient.useSession();
  const location = useLocation();

  if (isPending) {
    return (
      <Screen centered>
        <Stack align="center">
          <Spinner size={32} />
        </Stack>
      </Screen>
    );
  }
  if (session === null) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/sign-in?next=${next}`} replace />;
  }
  return <Outlet />;
};
