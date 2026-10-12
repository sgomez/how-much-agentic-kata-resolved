import { DrawQuestionRequest } from "@hmk/contracts/catalog";
import type {
  DrawQuestionResponse,
  ListPacksResponse,
} from "@hmk/contracts/catalog";
import type { ServiceApp } from "@hmk/kit";

import type { DrawQuestion } from "../application/draw-question.use-case.ts";
import type { ListPacks } from "../application/list-packs.query.ts";

export const catalogRoutes =
  (deps: {
    drawQuestion: Pick<DrawQuestion, "execute">;
    listPacks: Pick<ListPacks, "execute">;
  }) =>
  (app: ServiceApp): void => {
    app.get("/packs", async (c) => {
      const body: ListPacksResponse = { packs: await deps.listPacks.execute() };
      return c.json(body);
    });

    app.post("/decks/:gameId/draws", async (c) => {
      const { packs } = DrawQuestionRequest.parse(await c.req.json());
      const question = await deps.drawQuestion.execute({
        gameId: c.req.param("gameId"),
        packs,
      });
      const body: DrawQuestionResponse = { question };
      return c.json(body, 201);
    });
  };
