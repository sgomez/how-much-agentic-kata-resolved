import { useQuery } from "@tanstack/react-query";
import type { QueryKey } from "@tanstack/react-query";

/** How often a screen asks the server for its view (ADR-0003). */
export const POLL_INTERVAL_MS = 1000;

/**
 * Polls what this player should see on a screen, once per second.
 * Reconnecting needs nothing special: the next poll returns the full view.
 *
 * ```ts
 * const { data: view } = useView(["round", gameCode], () => api<RoundView>(`/rounds/${gameCode}/view`));
 * ```
 */
export const useView = <T>(key: QueryKey, fetcher: () => Promise<T>) =>
  useQuery({
    queryKey: key,
    queryFn: fetcher,
    refetchInterval: POLL_INTERVAL_MS,
  });
