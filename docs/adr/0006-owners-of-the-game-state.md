---
status: accepted
---

# Who owns each piece of the game state

Four services share one game, and several pieces of its state could live in more than one of them: the estimates, the current round, the impostor of a round, the points. The plenary gave each piece a single owner, so that every rule lives next to the data it protects, and drew the questions between services as an acyclic graph (ADR-0003):

| State | Owner | Others ask for it |
| --- | --- | --- |
| Players, host, nicknames, code, settings | Games | Scoring (players, in the order they joined) |
| Current round number, finished phase | Games | Nobody: phones ask Games |
| Each round by game and number: question, deadline, phase | Rounds | Scoring (deadline, ruler range, and the solution after the deadline) |
| Estimates | Scoring | Nobody: phones ask Scoring |
| Impostor of a round, votes, verdict | Impostor | Scoring (the verdict, once the voting is over) |
| Points and scoreboard | Scoring, computed on read | Nobody: phones ask Scoring |

```
Games → Rounds → Catalog
          ↓
       Impostor
Scoring → Games, Rounds, Impostor
```

- **Estimates live in Scoring, not in Rounds.** Scoring is what compares them with the solution, and the acceptance driver already sends them through scoring. Scoring checks the deadline and the ruler range with Rounds before accepting one.
- **Games keeps the current round number; Rounds only answers by game and number.** Games decides when the next round starts, so it is the only source of which round is current. It asks Rounds for round N+1 and only moves on once that round exists; when no question is left, the game is finished.
- **Impostor chooses the impostor; Rounds keeps a copy.** Rounds needs to know who the impostor is to leave the question out of their view (ADR-0003 makes that a rule of whoever builds the view). It asks Impostor when it creates the round and keeps the answer, which never changes during the round and never appears in any view. Impostor receives the candidates, the host and the deadline at that moment, so it never asks anyone.
- **The scoreboard is computed on read.** Scoring stores only estimates and works out the points from the solutions, the verdicts and the players each time someone asks. Scoring, not Impostor, turns a verdict into points.

## Considered Options

- **Estimates in Rounds.** It would protect the deadline inside one aggregate and allow a round to end early once everyone has answered. Rejected: it leaves Scoring with almost no domain of its own, and the scoring driver would have to call the rounds API. The price we accept: Rounds can never ask Scoring anything, so a round only ends at its deadline.
- **Rounds keeps the current round.** Rejected: Games decides when the next round starts, and two sources for the current round could disagree while it changes.
- **Impostor asks Rounds for the reveal and the deadline.** Rejected: Rounds already asks Impostor, so it would be a cycle. Impostor gets a copy of the deadline instead.

## Consequences

- Services form no cycle: Games, Rounds, Catalog, Impostor and Scoring can each be tested with in-memory adapters for the ones they ask.
- The round screen is composed by the phone: the current round number from Games, the round from Rounds and the player's own estimate from Scoring.
- If Rounds ever lets the host close a round before its deadline, Rounds must tell Impostor the new deadline (same direction, no cycle).
- If the host can ever change during a game, the copy of the host that Impostor keeps for each round can go stale.
