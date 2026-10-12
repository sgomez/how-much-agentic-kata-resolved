import { QueryCache, QueryClient } from "@tanstack/react-query";

import { ApiError } from "./api.ts";

const NO_RETRY_STATUSES = new Set([400, 401, 403, 404, 409, 422]);
const MAX_RETRIES = 2;

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      // The gateway forgot the session (it keeps sessions in memory): pick a nickname again.
      if (error instanceof ApiError && error.status === 401) {
        const next = encodeURIComponent(window.location.pathname);
        window.location.assign(`/sign-in?next=${next}`);
      }
    },
  }),
  defaultOptions: {
    queries: {
      // Polling already retries every second; only retry network hiccups.
      retry: (failures, error) =>
        failures < MAX_RETRIES &&
        !(error instanceof ApiError && NO_RETRY_STATUSES.has(error.status)),
    },
  },
});
