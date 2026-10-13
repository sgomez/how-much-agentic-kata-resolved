import { createServiceClient, runWithToken } from "@hmk/kit";
import { describe, expect, it } from "vitest";

import { ImpostorHttpAdapter } from "../src/infra/impostor-http.adapter.ts";

const json = (body: unknown, status: number) => Response.json(body, { status });

const adapterAnswering = (response: Response) =>
  new ImpostorHttpAdapter(
    createServiceClient("http://impostor.test", () => Promise.resolve(response))
  );

describe("impostor HTTP adapter", () => {
  it("reads the verdict of a round, forwarding the host's token", async () => {
    const calls: { url: string; auth: string | null }[] = [];
    const fetchFn: typeof fetch = (input, init) => {
      calls.push({
        auth: new Headers(init?.headers).get("authorization"),
        url: String(input),
      });
      return Promise.resolve(
        json({ impostorId: "u2", verdict: "caught" }, 200)
      );
    };
    const adapter = new ImpostorHttpAdapter(
      createServiceClient("http://impostor.test", fetchFn)
    );

    const verdict = await runWithToken("host-token", () =>
      adapter.verdict("KQZT", 2)
    );

    expect(verdict).toBe("caught");
    expect(calls).toStrictEqual([
      {
        auth: "Bearer host-token",
        url: "http://impostor.test/internal/KQZT/2/verdict",
      },
    ]);
  });

  it("answers null while the voting is not over", async () => {
    const adapter = adapterAnswering(
      json({ impostorId: null, verdict: null }, 200)
    );

    await expect(adapter.verdict("KQZT", 1)).resolves.toBeNull();
  });

  it("fails on a 404, never passes", async () => {
    const adapter = adapterAnswering(
      json({ error: { code: "round-not-found", message: "none" } }, 404)
    );

    await expect(adapter.verdict("KQZT", 1)).rejects.toMatchObject({
      code: "round-not-found",
      status: 404,
    });
  });
});
