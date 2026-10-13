import { ServiceCallError } from "@hmk/kit";
import type { ServiceClient } from "@hmk/kit";
import { describe, expect, it } from "vitest";

import { UnknownCode } from "../src/domain/scoring.errors.ts";
import { GamesHttpAdapter } from "../src/infra/games-http.adapter.ts";

describe(GamesHttpAdapter, () => {
  it("fetches game players and impostorMode successfully", async () => {
    const fakeClient: ServiceClient = {
      get: <S>(path: string): Promise<S> => {
        expect(path).toBe("/internal/ABCD/players");
        return Promise.resolve({
          impostorMode: true,
          players: [
            { id: "p1", nickname: "Ana" },
            { id: "p2", nickname: "Luis" },
          ],
        } as S);
      },
      post: () => Promise.reject(new Error("not implemented")),
    };

    const adapter = new GamesHttpAdapter(fakeClient);
    const result = await adapter.getGame("ABCD");

    expect(result).toStrictEqual({
      impostorMode: true,
      players: [
        { id: "p1", nickname: "Ana" },
        { id: "p2", nickname: "Luis" },
      ],
    });
  });

  it("maps unknown-code ServiceCallError to UnknownCode domain error", async () => {
    const fakeClient: ServiceClient = {
      get: () =>
        Promise.reject(new ServiceCallError(404, "unknown-code", "not found")),
      post: () => Promise.reject(new Error("not implemented")),
    };

    const adapter = new GamesHttpAdapter(fakeClient);
    await expect(adapter.getGame("ABCD")).rejects.toThrow(UnknownCode);
  });

  it("rethrows unexpected ServiceCallError without swallowing", async () => {
    const fakeClient: ServiceClient = {
      get: () =>
        Promise.reject(new ServiceCallError(500, "internal", "server error")),
      post: () => Promise.reject(new Error("not implemented")),
    };

    const adapter = new GamesHttpAdapter(fakeClient);
    await expect(adapter.getGame("ABCD")).rejects.toThrow(ServiceCallError);
  });
});
