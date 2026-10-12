import type { z } from "zod";

import type { GatewayHttp } from "../dsl/drivers.ts";

/** A call through the gateway answered with an unexpected status. */
export class GatewayCallError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(method: string, path: string, status: number, body: unknown) {
    super(`${method} /api${path} answered ${status}: ${JSON.stringify(body)}`);
    this.name = "GatewayCallError";
    this.status = status;
    this.body = body;
  }
}

/** HTTP through the gateway with a session cookie, like a browser. */
export const gatewayHttp = (baseUrl: string, cookie: string): GatewayHttp => {
  const request: GatewayHttp["request"] = async (method, path, body) => {
    const headers = { cookie, origin: baseUrl };
    const res = await fetch(
      `${baseUrl}/api${path}`,
      body === undefined
        ? { headers, method }
        : {
            body: JSON.stringify(body),
            headers: { ...headers, "content-type": "application/json" },
            method,
          }
    );
    const text = await res.text();
    return {
      status: res.status,
      body: text === "" ? undefined : (JSON.parse(text) as unknown),
    };
  };

  const parsed = async <S extends z.ZodType>(
    method: "GET" | "POST",
    path: string,
    schema: S,
    body?: unknown
  ): Promise<z.infer<S>> => {
    const res = await request(method, path, body);
    if (res.status < 200 || res.status >= 300) {
      throw new GatewayCallError(method, path, res.status, res.body);
    }
    return schema.parse(res.body);
  };

  return {
    get: (path, schema) => parsed("GET", path, schema),
    post: (path, body, schema) => parsed("POST", path, schema, body),
    request,
  };
};
