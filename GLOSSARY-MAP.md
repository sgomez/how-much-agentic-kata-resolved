# Glossary Map

How Much Agentic Kata has one context per service. Each owns its vocabulary in its own `GLOSSARY.md`. Who owns which piece of game state, and why, is in [ADR-0006](./docs/adr/0006-owners-of-the-game-state.md).

## Contexts

- [Catalog](./services/catalog/GLOSSARY.md): the question bank; draws questions for a game without repeating them
- [Games](./services/games/GLOSSARY.md): players, host, code, settings, the current round and when a game is finished
- [Rounds](./services/rounds/GLOSSARY.md): every round of a game, its deadline, its phase and what each player sees of it
- [Scoring](./services/scoring/GLOSSARY.md): estimates, points and the scoreboard
- [Impostor](./services/impostor/GLOSSARY.md): the impostor of each round, the voting and its verdict

## Shared game language (DRAFT)

- [Game glossary draft](./docs/game-glossary-draft.md): what the plenary left open, each question with the group that owns it.

## Relationships

- **Games → Rounds**: Games asks Rounds to create the next round of a game, with the settings it needs, and only moves its current round on once that round exists.
- **Rounds → Catalog**: Rounds asks the Catalog to draw the next question of a game over HTTP (`@hmk/contracts/catalog`).
- **Rounds → Impostor**: when it creates a round of a game in impostor mode, Rounds asks Impostor to choose the impostor, giving it the candidates, the host and the deadline. Rounds keeps a copy of who the impostor is to build each player's view.
- **Scoring → Rounds**: Scoring asks Rounds for a round's deadline and ruler range, and for its solution once the deadline has passed.
- **Scoring → Games**: Scoring asks Games for the players of a game, in the order they joined.
- **Scoring → Impostor**: Scoring asks Impostor for a round's verdict, which Impostor only gives once the voting is over.
