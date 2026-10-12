import { describe, expect, it } from "vitest";
import { z } from "zod";

import { ServiceCallError, createServiceClient } from "../src/index.ts";

describe(createServiceClient, () => {
  it("validates the response with the given schema", async () => {
    const client = createServiceClient("http://x.internal", () =>
      Promise.resolve(Response.json({ n: "nope" }))
    );

    await expect(
      client.get("/n", z.object({ n: z.number() }))
    ).rejects.toBeInstanceOf(z.ZodError);
  });

  it("turns an error answer into a ServiceCallError with the callee's code", async () => {
    const client = createServiceClient("http://x.internal", () =>
      Promise.resolve(
        Response.json(
          { error: { code: "deck-exhausted", message: "No more" } },
          { status: 409 }
        )
      )
    );

    await expect(client.post("/d", {}, z.unknown())).rejects.toMatchObject(
      new ServiceCallError(409, "deck-exhausted", "No more")
    );
  });
});
