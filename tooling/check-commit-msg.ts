// commit-msg hook (lefthook): Conventional Commits, written in English.
// Usage: node tooling/check-commit-msg.ts <path-to-commit-message-file>
import { readFileSync } from "node:fs";

const TYPES = [
  "build",
  "chore",
  "ci",
  "docs",
  "feat",
  "fix",
  "perf",
  "refactor",
  "revert",
  "style",
  "test",
];
const HEADER = new RegExp(
  `^(${TYPES.join("|")})(\\([a-z0-9-]+\\))?!?: \\S.{0,99}$`,
  "u"
);
// Letters and marks that only show up when the message is in Spanish.
const NOT_ENGLISH = /[áéíóúüñÁÉÍÓÚÜÑ¿¡]/u;

/** Problems with a commit message; empty when it is fine. */
export const commitMessageProblems = (message: string): string[] => {
  const [header = ""] = message.split("\n");
  if (/^(?:Merge|Revert|fixup!|squash!) /u.test(header)) {
    return [];
  }
  const problems: string[] = [];
  if (!HEADER.test(header)) {
    problems.push(
      `The first line must look like "<type>(<optional scope>): <summary>" with type one of ${TYPES.join(", ")}, e.g. "feat(games): let players join with a code". Got: "${header}"`
    );
  }
  if (NOT_ENGLISH.test(message)) {
    problems.push(
      "Write commit messages in English (AGENTS.md): only UI strings in apps/web are Spanish."
    );
  }
  return problems;
};

const file = process.argv.at(2);
if (file !== undefined && import.meta.main) {
  const problems = commitMessageProblems(readFileSync(file, "utf-8"));
  if (problems.length > 0) {
    console.error(problems.map((problem) => `✖ ${problem}`).join("\n"));
    process.exit(1);
  }
}
