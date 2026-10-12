import { AsyncLocalStorage } from "node:async_hooks";

const storage = new AsyncLocalStorage<{ token: string }>();

/** Runs `fn` with the caller's token available to outgoing service calls. */
export const runWithToken = <T>(
  token: string,
  fn: () => Promise<T>
): Promise<T> => storage.run({ token }, fn);

/** The bearer token of the request being handled, if any. */
export const currentToken = (): string | undefined => storage.getStore()?.token;
