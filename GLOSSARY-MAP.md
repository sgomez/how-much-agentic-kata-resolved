# Glossary Map

How Much Agentic Kata has one context per service. Each owns its vocabulary in its own `GLOSSARY.md`.

## Contexts

- [Catalog](./services/catalog/GLOSSARY.md): the question bank; draws questions for a game without repeating them
- [Games](./services/games/GLOSSARY.md): owned by the games group
- [Rounds](./services/rounds/GLOSSARY.md): owned by the rounds group
- [Scoring](./services/scoring/GLOSSARY.md): owned by the scoring group
- [Impostor](./services/impostor/GLOSSARY.md): owned by the impostor group

## Shared game language (DRAFT)

- [Game glossary draft](./docs/game-glossary-draft.md): words every group uses, full of open questions on purpose. Resolved in the plenary; each resolved term then moves into the glossary of the context that owns it.

## Relationships

- **Rounds → Catalog**: Rounds asks the Catalog to draw the next question of a game over HTTP (`@hmk/contracts/catalog`).
- _The other relationships are decided by the groups during the kata. Record each one here as `**A → B**: what A asks B for`._
