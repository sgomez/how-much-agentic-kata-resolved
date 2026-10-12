import { ForceNextQuestionRequest } from "@hmk/contracts/catalog";
import type { ServiceApp } from "@hmk/kit";

/** Only mounted when HMK_TEST_MODE=1. Used by the acceptance tests. */
export const testModeRoutes =
  (deps: { rig: (question: ForceNextQuestionRequest) => void }) =>
  (app: ServiceApp): void => {
    app.post("/test/next-question", async (c) => {
      deps.rig(ForceNextQuestionRequest.parse(await c.req.json()));
      return c.body(null, 204);
    });
  };
