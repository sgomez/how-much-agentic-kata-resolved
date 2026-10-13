import { createServiceClient, runWithToken, ServiceCallError } from "@hmk/kit";
import { describe, expect, it } from "vitest";

import { NotAPlayer, RoundNotFound } from "../src/domain/scoring.errors.ts";
import { RoundsHttpAdapter } from "../src/infra/rounds-http.adapter.ts";

const sampleRound = {
  number: 1,
  deadline: "2026-10-13T10:00:00.000Z",
  min: 0,
  max: 100,
  solution: null,
};

describe(RoundsHttpAdapter, () => {
  it("fetches round details through the rounds internal contract, forwarding the player's token", async () => {
    const requests: Request[] = [];
    const client = createServiceClient(
      "http://rounds.internal",
      (input, init) => {
        requests.push(new Request(input, init));
        return Promise.resolve(Response.json(sampleRound, { status: 200 }));
      }
    );
    const adapter = new RoundsHttpAdapter(client);

    const round = await runWithToken("ana-token", () =>
      adapter.getRound("game 1", 1)
    );

    expect(round).toStrictEqual(sampleRound);
    expect(requests[0]?.url).toBe("http://rounds.internal/internal/game%201/1");
    expect(requests[0]?.headers.get("authorization")).toBe("Bearer ana-token");
  });

  it("maps ServiceCallError round-not-found to domain RoundNotFound", async () => {
    const client = createServiceClient("http://rounds.internal", () =>
      Promise.resolve(
        Response.json(
          { error: { code: "round-not-found", message: "Round 2 not found" } },
          { status: 404 }
        )
      )
    );
    const adapter = new RoundsHttpAdapter(client);

    await expect(
      runWithToken("ana-token", () => adapter.getRound("GAME", 2))
    ).rejects.toThrow(RoundNotFound);
  });

  it("maps ServiceCallError not-a-player to domain NotAPlayer", async () => {
    const client = createServiceClient("http://rounds.internal", () =>
      Promise.resolve(
        Response.json(
          { error: { code: "not-a-player", message: "Not a player" } },
          { status: 403 }
        )
      )
    );
    const adapter = new RoundsHttpAdapter(client);

    await expect(
      runWithToken("ana-token", () => adapter.getRound("GAME", 1))
    ).rejects.toThrow(NotAPlayer);
  });

  it("lets any other ServiceCallError throw unchanged", async () => {
    const client = createServiceClient("http://rounds.internal", () =>
      Promise.resolve(
        Response.json(
          { error: { code: "unexpected", message: "Internal error" } },
          { status: 500 }
        )
      )
    );
    const adapter = new RoundsHttpAdapter(client);

    await expect(
      runWithToken("ana-token", () => adapter.getRound("GAME", 1))
    ).rejects.toThrow(ServiceCallError);
  });
});
