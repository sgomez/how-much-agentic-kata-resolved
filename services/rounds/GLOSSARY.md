# Rounds

The rounds of every game: which question each one asks, until when players can estimate, and what each player sees of it.

## Language

**Round**: One question played in a game, identified by the game and its round number. A round of a game in impostor mode is a normal round with one impostor. _Avoid_: Turn, question

**Round number**: The position of a round in its game, starting at 1. _Avoid_: Index, turn number

**Deadline**: The moment a round stops taking estimates. Only the deadline ends a round. _Avoid_: Timeout, end time, timer

**Estimating**: The phase of a round before its deadline. _Avoid_: Open, active, in progress

**Revealed**: The phase of a round after its deadline, when every player sees its solution. Ending and revealing are the same moment. _Avoid_: Closed, finished, over

**Impostor's view**: What the impostor of a round sees: everything the other players see except the question. The impostor knows they are the impostor as soon as the round appears. _Avoid_: Blind view, hidden question

### Borrowed terms

**Game**: See the [Games glossary](../games/GLOSSARY.md). Rounds keeps every round of a game, not which one is current.

**Question**, **Solution**, **Unit**, **Ruler range**: See the [Catalog glossary](../catalog/GLOSSARY.md). Rounds copies them from the catalog and does not decide them.

**Impostor**: See the [Impostor glossary](../impostor/GLOSSARY.md). Impostor chooses the impostor of a round; Rounds keeps a copy of who it is, which no view shows.
