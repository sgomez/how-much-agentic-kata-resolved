import { ServiceCallError, createServiceClient, runWithToken } from "@hmk/kit";
import { describe, expect, it } from "vitest";

import { ImpostorHttpAdapter } from "../src/infra/impostor-http.adapter.ts";

const candidates = [
  { id: "p1", nickname: "Ana" },
  { id: "p2", nickname: "Beto" },
];

describe(ImpostorHttpAdapter, () => {
  it("asks Impostor through the contract, forwarding the host token", async () => {
    const requests: Request[] = [];
    const impostor = new ImpostorHttpAdapter(
      createServiceClient("http://impostor.internal", (input, init) => {
        requests.push(new Request(input, init));
        return Promise.resolve(
          Response.json({ impostorId: "p2" }, { status: 201 })
        );
      })
    );

    const deadline = new Date("2026-01-01T12:00:30.000Z");
    const chosen = await runWithToken("host-token", () =>
      impostor.chooseImpostor("game 1", 1, candidates, "p1", deadline)
    );

    expect(chosen).toBe("p2");
    expect(requests[0]?.url).toBe(
      "http://impostor.internal/internal/game%201/1/impostor"
    );
    expect(requests[0]?.headers.get("authorization")).toBe("Bearer host-token");
    await expect(requests[0]?.json()).resolves.toStrictEqual({
      candidates,
      deadline: "2026-01-01T12:00:30.000Z",
      hostId: "p1",
    });
  });

  it("propagates failure when impostor service returns an error", async () => {
    const impostor = new ImpostorHttpAdapter(
      createServiceClient("http://impostor.internal", () =>
        Promise.resolve(
          Response.json(
            { error: { code: "server-error", message: "Failed" } },
            { status: 500 }
          )
        )
      )
    );

    const deadline = new Date("2026-01-01T12:00:30.000Z");
    await expect(
      runWithToken("host-token", () =>
        impostor.chooseImpostor("game-1", 1, candidates, "p1", deadline)
      )
    ).rejects.toThrow(ServiceCallError);
  });
});
