import { ServiceCallError } from "@hmk/kit";
import type { ServiceClient } from "@hmk/kit";
import { describe, expect, it } from "vitest";

import { ImpostorHttpAdapter } from "../src/infra/impostor-http.adapter.ts";

describe(ImpostorHttpAdapter, () => {
  it("fetches round verdict successfully", async () => {
    const fakeClient: ServiceClient = {
      get: <S>(path: string): Promise<S> => {
        expect(path).toBe("/internal/ABCD/1/verdict");
        return Promise.resolve({
          impostorId: "p-imp",
          verdict: "caught",
        } as S);
      },
      post: () => Promise.reject(new Error("not implemented")),
    };

    const adapter = new ImpostorHttpAdapter(fakeClient);
    const result = await adapter.getVerdict("ABCD", 1);

    expect(result).toStrictEqual({
      impostorId: "p-imp",
      verdict: "caught",
    });
  });

  it("rethrows ServiceCallError when impostor fails or returns 404", async () => {
    const fakeClient: ServiceClient = {
      get: () =>
        Promise.reject(
          new ServiceCallError(404, "round-not-found", "not found")
        ),
      post: () => Promise.reject(new Error("not implemented")),
    };

    const adapter = new ImpostorHttpAdapter(fakeClient);
    await expect(adapter.getVerdict("ABCD", 1)).rejects.toThrow(
      ServiceCallError
    );
  });
});
