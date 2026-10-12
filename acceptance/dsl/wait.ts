import { setTimeout as sleep } from "node:timers/promises";

const POLL_MS = 200;
const DEFAULT_TIMEOUT_MS = 10_000;

/**
 * Polls like a phone does until `check` returns a value (not undefined).
 * Errors from `check` propagate at once, so a PendingContract fails fast.
 */
export const waitFor = async <T>(
  description: string,
  check: () => Promise<T | undefined>,
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<T> => {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    // oxlint-disable-next-line no-await-in-loop -- polling is sequential by nature.
    const result = await check();
    if (result !== undefined) {
      return result;
    }
    // oxlint-disable-next-line no-await-in-loop
    await sleep(POLL_MS);
  }
  throw new Error(
    `Timed out after ${timeoutMs} ms waiting for: ${description}`
  );
};
