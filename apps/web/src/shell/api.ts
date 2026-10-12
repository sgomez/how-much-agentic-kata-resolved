/** A non-2xx answer from the gateway or a service, with the service's error code. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

const readError = async (res: Response): Promise<ApiError> => {
  try {
    const body = (await res.json()) as {
      error?: { code?: string; message?: string };
    };
    return new ApiError(
      res.status,
      body.error?.code ?? "unexpected",
      body.error?.message ?? res.statusText
    );
  } catch {
    return new ApiError(res.status, "unexpected", res.statusText);
  }
};

/**
 * Calls a service through the gateway: `api("/games/...")` hits `/api/games/...`.
 * The session cookie goes along; the gateway turns it into a JWT for the service.
 */
export const api = async <T>(
  path: string,
  init: { method?: "GET" | "POST"; body?: unknown } = {}
): Promise<T> => {
  const res = await fetch(`/api${path}`, {
    method: init.method ?? (init.body === undefined ? "GET" : "POST"),
    headers:
      init.body === undefined ? {} : { "content-type": "application/json" },
    body: init.body === undefined ? null : JSON.stringify(init.body),
    credentials: "same-origin",
  });
  if (!res.ok) {
    throw await readError(res);
  }
  return (res.status === 204 ? undefined : await res.json()) as T;
};
