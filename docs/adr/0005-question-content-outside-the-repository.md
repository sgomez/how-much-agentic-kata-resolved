---
status: accepted
---

# Question content lives outside the repository

The real questions are the facilitator's content: they are not committed. The facilitator distributes `questions.json` through a download link on the day, and the catalog loads it from `CATALOG_FILE` (default `data/questions.json`, which is gitignored). The repository only holds the file's schema (`QuestionsFile` in `@hmk/contracts/catalog`), a validator (`pnpm catalog:validate <file>`) and clearly synthetic fixtures ("Synthetic question 1"). This keeps the content out of a public repository and out of every fork, and lets the facilitator change it without a commit.

## Consequences

- Without the file, the catalog starts with the synthetic sample and logs a warning, so the system always runs.
- Tests and acceptance tests never depend on real content: the acceptance DSL rigs the next question in test mode (`HMK_TEST_MODE=1`).
- Anyone running the game for real must download the file into `data/` first (README).
