import { ListPacksResponse } from "@hmk/contracts/catalog";
import { z } from "zod";

import type { CatalogDriver } from "../dsl/drivers.ts";

export const catalogDriver: CatalogDriver = {
  packs: async (player) => {
    const { packs } = await player.http.get(
      "/catalog/packs",
      ListPacksResponse
    );
    return packs.map((pack) => pack.name);
  },
  rigNextQuestion: async (player, question) => {
    await player.http.post(
      "/catalog/test/next-question",
      question,
      z.unknown()
    );
  },
};
