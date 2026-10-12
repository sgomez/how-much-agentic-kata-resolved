import { ErrorBody } from "@hmk/contracts";
import type { z } from "zod";

import { currentToken } from "./request-context.ts";

/** A non-2xx answer from another service. */
export class ServiceCallError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "ServiceCallError";
    this.status = status;
    this.code = code;
  }
}

export interface ServiceClient {
  get: <S extends z.ZodType>(path: string, response: S) => Promise<z.infer<S>>;
  post: <S extends z.ZodType>(
    path: string,
    body: unknown,
    response: S
  ) => Promise<z.infer<S>>;
}

/**
 * Typed HTTP client for calling another service from an `infra/*-http.adapter.ts`.
 * It forwards the current player's token, so the callee knows who is asking,
 * and validates the response with the callee's schema from `@hmk/contracts`.
 */
export const createServiceClient = (
  baseUrl: string,
  fetchFn: typeof fetch = fetch
): ServiceClient => {
  const call = async <S extends z.ZodType>(
    method: string,
    path: string,
    response: S,
    body?: unknown
  ): Promise<z.infer<S>> => {
    const headers = new Headers({ accept: "application/json" });
    const token = currentToken();
    if (token !== undefined) {
      headers.set("authorization", `Bearer ${token}`);
    }
    const init: RequestInit = { headers, method };
    if (body !== undefined) {
      headers.set("content-type", "application/json");
      init.body = JSON.stringify(body);
    }
    const res = await fetchFn(new URL(path, baseUrl), init);
    const json: unknown = res.status === 204 ? undefined : await res.json();
    if (!res.ok) {
      const parsed = ErrorBody.safeParse(json);
      const error = parsed.success
        ? parsed.data.error
        : {
            code: "unexpected",
            message: `${method} ${path} answered ${res.status}`,
          };
      throw new ServiceCallError(res.status, error.code, error.message);
    }
    return response.parse(json);
  };

  return {
    get: (path, response) => call("GET", path, response),
    post: (path, body, response) => call("POST", path, response, body),
  };
};
