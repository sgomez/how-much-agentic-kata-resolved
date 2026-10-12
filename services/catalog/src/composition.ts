import path from "node:path";

import { createJwksVerifier } from "@hmk/auth";
import type { TokenVerifier } from "@hmk/auth";
import { createService } from "@hmk/kit";
import type { ServiceApp } from "@hmk/kit";
import { jwksUrl } from "@hmk/kit/topology";

import { DrawQuestion } from "./application/draw-question.use-case.ts";
import { ListPacks } from "./application/list-packs.query.ts";
import type { QuestionSource } from "./domain/ports/question-source.port.ts";
import type { Random } from "./domain/ports/random.port.ts";
import { catalogRoutes } from "./http/catalog.routes.ts";
import { testModeRoutes } from "./http/test-mode.routes.ts";
import { FileQuestionSource } from "./infra/file-question-source.adapter.ts";
import { mathRandom } from "./infra/math-random.adapter.ts";
import { MemoryDeckRepository } from "./infra/memory-deck-repository.adapter.ts";
import { RiggedDraws } from "./infra/rigged-draws.adapter.ts";

export interface CatalogDeps {
  verifier: TokenVerifier;
  source: QuestionSource;
  random: Random;
  testMode: boolean;
  log?: boolean;
}

/** `data/questions.json` at the repository root. */
const DEFAULT_CATALOG_FILE = path.resolve(
  import.meta.dirname,
  "../../../data/questions.json"
);

/** Composition root: the only file that sees every layer. */
export const composeCatalog = ({
  verifier,
  source,
  random,
  testMode,
  log,
}: CatalogDeps): ServiceApp => {
  const decks = new MemoryDeckRepository();
  const listPacks = new ListPacks({ source });
  const drawQuestion = new DrawQuestion({ decks, random, source });

  if (!testMode) {
    return createService({
      log,
      name: "catalog",
      routes: [catalogRoutes({ drawQuestion, listPacks })],
      verifier,
    });
  }
  const rigged = new RiggedDraws(drawQuestion);
  return createService({
    log,
    name: "catalog",
    routes: [
      catalogRoutes({ drawQuestion: rigged, listPacks }),
      testModeRoutes({ rig: (question) => rigged.rig(question) }),
    ],
    verifier,
  });
};

/** The catalog wired with its real adapters, configured from the environment. */
export const composeCatalogFromEnv = (env: NodeJS.ProcessEnv): ServiceApp =>
  composeCatalog({
    log: true,
    random: mathRandom,
    source: new FileQuestionSource(env.CATALOG_FILE ?? DEFAULT_CATALOG_FILE),
    testMode: env.HMK_TEST_MODE === "1",
    verifier: createJwksVerifier(jwksUrl()),
  });
