import type { Question } from "@hmk/contracts/catalog";

/** The catalog service, as rounds needs it. */
export interface CatalogPort {
  /**
   * Draws a question for a game. The catalog never repeats a question within
   * the same game. `packs` limits the draw to those packs; omit it, or pass an empty list,
   * for all.
   */
  drawQuestion: (
    gameId: string,
    packs?: readonly string[]
  ) => Promise<Question>;
}
