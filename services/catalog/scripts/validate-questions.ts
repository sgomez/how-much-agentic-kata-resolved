// Usage: pnpm catalog:validate <path-to-questions.json>
// Checks a downloaded questions file against the catalog's schema.
import { readFile } from "node:fs/promises";

import { QuestionsFile } from "@hmk/contracts/catalog";
import { z } from "zod";

const path = process.argv.at(2);
if (path === undefined) {
  console.error("Usage: pnpm catalog:validate <path-to-questions.json>");
  process.exit(2);
}

const result = QuestionsFile.safeParse(
  JSON.parse(await readFile(path, "utf-8"))
);
if (!result.success) {
  console.error(
    `${path} is NOT a valid questions file:\n${z.prettifyError(result.error)}`
  );
  process.exit(1);
}
const packs = new Set(result.data.map((question) => question.pack));
console.log(
  `${path} is valid: ${result.data.length} questions in ${packs.size} packs.`
);
