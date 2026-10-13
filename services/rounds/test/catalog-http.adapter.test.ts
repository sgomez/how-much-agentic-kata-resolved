import { createServiceClient, runWithToken } from "@hmk/kit";
import { describe, expect, it } from "vitest";

import { CatalogHttpAdapter } from "../src/infra/catalog-http.adapter.ts";

const question = {
  id: "q1",
  text: "Synthetic question 1",
  unit: "units",
  solution: 10,
  pack: "synthetic-a",
  min: 0,
  max: 100,
};

describe(CatalogHttpAdapter, () => {
  it("draws through the catalog contract, forwarding the player's token", async () => {
    const requests: Request[] = [];
    const catalog = new CatalogHttpAdapter(
      createServiceClient("http://catalog.internal", (input, init) => {
        requests.push(new Request(input, init));
        return Promise.resolve(Response.json({ question }, { status: 201 }));
      })
    );

    const drawn = await runWithToken("ana-token", () =>
      catalog.drawQuestion("game 1", ["synthetic-a"])
    );

    expect(drawn).toStrictEqual(question);
    expect(requests[0]?.url).toBe(
      "http://catalog.internal/internal/decks/game%201/draws"
    );
    expect(requests[0]?.headers.get("authorization")).toBe("Bearer ana-token");
    await expect(requests[0]?.json()).resolves.toStrictEqual({
      packs: ["synthetic-a"],
    });
  });

  it("treats an empty pack list as every pack", async () => {
    const requests: Request[] = [];
    const catalog = new CatalogHttpAdapter(
      createServiceClient("http://catalog.internal", (input, init) => {
        requests.push(new Request(input, init));
        return Promise.resolve(Response.json({ question }, { status: 201 }));
      })
    );

    await runWithToken("ana-token", () => catalog.drawQuestion("game-1", []));

    await expect(requests[0]?.json()).resolves.toStrictEqual({});
  });

  it("throws DeckExhaustedError when catalog returns deck-exhausted", async () => {
    const catalog = new CatalogHttpAdapter(
      createServiceClient("http://catalog.internal", () =>
        Promise.resolve(
          Response.json(
            { error: { code: "deck-exhausted", message: "Deck exhausted" } },
            { status: 409 }
          )
        )
      )
    );

    await expect(
      runWithToken("ana-token", () => catalog.drawQuestion("game-1"))
    ).rejects.toThrow("Deck exhausted for game game-1");
  });
});
