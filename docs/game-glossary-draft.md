# Game glossary (DRAFT): what the plenary left open

> **This is a draft, not a glossary.** The plenary resolved the shared words and moved each one into the `GLOSSARY.md` of the service that owns it (see [GLOSSARY-MAP.md](../GLOSSARY-MAP.md)); who owns which state is in [ADR-0006](./adr/0006-owners-of-the-game-state.md). What remains here is still open. Each question names the group that decides it. Until it is decided, do not build on any one reading of it. Once a group decides, move the answer into its glossary (or its ADRs) and delete the question from here.

## Games

- **Host leaving**: What happens when the host leaves or their phone dies mid-game? Does the role pass to another player, or does the game end? Impostor keeps a copy of the host for each round, so a host who changes mid-round would leave that copy stale.
- **Editing settings in the lobby**: Settings are chosen when the game is created and do not change for now. Can the host edit them while the game is still in the lobby?
- **Joining from the next round**: Joining a game after it has started is rejected. Should a late player be able to join from the next round instead?
- **Moving to the next round**: Games decides when the next round starts. Does the host press a button, or does the game move on by itself after a few seconds? In a game in impostor mode, does the next round wait for the voting to end?

## Rounds

- **Ruler scale and step**: The ruler range, the scale and, if needed, the step come from the catalog, and Rounds copies them. Today the catalog's question has a ruler range but no scale or step. Changing the catalog is a shared change, through a PR. Until then, the round screen picks the scale from the ruler range and takes any number in it.

## Scoring

- **Points for catching the impostor**: In the original game, when the impostor is caught every other player gets 2 extra points. Do we add it?
- **Absolute distance on large numbers**: Distance is an absolute difference, so being 10 off weighs the same whether the solution is 3 or 300,000. Recorded as a known risk.

## Not discussed in the plenary

`packages/ui/docs/open-decisions.md` lists more product rules nobody has decided yet: the minimum number of players (Games), game capacity (Games), the game code format (Games), what the verdict shows (Impostor) and when the scoreboard appears (Scoring).
