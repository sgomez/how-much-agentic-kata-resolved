# Glossary Map

How Much Agentic Kata has one context per service. Each owns its vocabulary in its own `GLOSSARY.md`.

## Contexts

- [Catalog](./services/catalog/GLOSSARY.md): the question bank; draws questions for a game without repeating them
- [Games](./services/games/GLOSSARY.md): gathers players behind a code and runs a game from its lobby to its end
- [Rounds](./services/rounds/GLOSSARY.md): runs each round of a game, its question and its deadline, and builds each player's round view
- [Scoring](./services/scoring/GLOSSARY.md): keeps the estimates and turns them and the impostor verdicts into points
- [Impostor](./services/impostor/GLOSSARY.md): picks each round's impostor, collects the votes and decides the verdict

## Shared game language (DRAFT)

- [Game glossary draft](./docs/game-glossary-draft.md): words every group uses, full of open questions on purpose. Resolved in the plenary; each resolved term then moves into the glossary of the context that owns it.

## Relationships

Services ask; nobody pushes, and no two services ask each other (ADR-0003). The phone asks each service for its own view and puts the screen together, so it adds no relationship between services.

- **Games → Rounds**: Games asks Rounds to start each round of a game.
- **Rounds → Catalog**: Rounds asks the Catalog to draw the next question of a game over HTTP (`@hmk/contracts/catalog`).
- **Rounds → Impostor**: When Rounds creates a round, it asks Impostor to pick that round's impostor among the candidates it passes along; Rounds keeps who the impostor is only to hide the question from them. Rounds also tells Impostor when a round closes early. This is service-to-service only, never reachable through the gateway.
- **Scoring → Rounds**: Scoring asks Rounds for a round's solution and deadline, to accept estimates and score them.
- **Scoring → Impostor**: Scoring asks Impostor for a round's verdict, to turn it into points.
- **Scoring → Games**: Scoring asks Games about the players of a game.
- **Impostor** asks no other service.
