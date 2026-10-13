# Game glossary (DRAFT): what the plenary left open

> **This is a draft, not a glossary.** The plenary resolved the shared words and moved each one into the `GLOSSARY.md` of the service that owns it (see [GLOSSARY-MAP.md](../GLOSSARY-MAP.md)); who owns which state is in [ADR-0006](./adr/0006-owners-of-the-game-state.md). What remains here is still open. Each question names the group that decides it. Until it is decided, do not build on any one reading of it. Once a group decides, move the answer into its glossary (or its ADRs) and delete the question from here.

## Rounds

- **Closing a round early**: Can the host close a round before its deadline? If so, Rounds must tell Impostor the new deadline.
- **Ruler scale and step**: The ruler range, the scale and, if needed, the step come from the catalog, and Rounds copies them. Today the catalog's question has a ruler range but no scale or step. Changing the catalog is a shared change, through a PR.

## Scoring

- **Points for catching the impostor**: In the original game, when the impostor is caught every other player gets 2 extra points. Do we add it?
- **Absolute distance on large numbers**: Distance is an absolute difference, so being 10 off weighs the same whether the solution is 3 or 300,000. Recorded as a known risk.

## Impostor

- **Hiding the solution until after the vote**: In the original game, impostor rounds reveal the estimates without the solution, and the solution only after the vote. For now the solution is shown at the reveal, like in any round. Do we hide it?

## Not discussed in the plenary

`packages/ui/docs/open-decisions.md` lists more product rules nobody has decided yet: game capacity (Games), what the verdict shows (Impostor) and when the scoreboard appears (Scoring). Games has settled the minimum number of players and nobody leaving a game (in its glossary) and the game code format (in its spec).
