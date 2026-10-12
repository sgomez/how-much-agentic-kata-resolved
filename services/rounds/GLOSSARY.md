# Rounds

Runs the rounds of a game: which question each round asks, until when players can estimate, and what each player's round screen shows.

## Language

**Round**: One question of a game that every player estimates before the same deadline. A round has exactly one question; an impostor game has no special kind of round. _Avoid_: Turn

**Deadline**: The moment a round stops accepting estimates. The round sets it when it is created, and an early close moves it earlier. No phone decides it. _Avoid_: Timeout, time limit

**Early close**: The host ending a round before its deadline; that moment becomes the round's deadline. _Avoid_: Skip, force close

### Phases

**Estimating**: The phase of a round before its deadline, while players can send estimates. _Avoid_: Open, active

**Revealed**: The phase of a round once its deadline has passed: the round is closed and its solution is shown, at the same moment. _Avoid_: Closed, finished, ended

### Borrowed terms

**Question**, **Solution**, **Unit**: As defined by the [Catalog](../catalog/GLOSSARY.md).

**Impostor**: As defined by [Impostor](../impostor/GLOSSARY.md). A round knows who its impostor is only to hide the question from them; the impostor's round view looks like everyone else's, without the question.

**Estimate**: As defined by [Scoring](../scoring/GLOSSARY.md). A round does not keep estimates.
