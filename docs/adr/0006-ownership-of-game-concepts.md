---
status: accepted
---

# Ownership of the game concepts between the four services

In the plenary the groups agreed which service owns each shared game concept, so that four groups can build in parallel on one vocabulary. **Games** owns players, the host, nicknames, the lobby and the game code. **Rounds** owns rounds, their question, their deadline (including an early close by the host) and each player's round view. **Scoring** owns estimates, points and the scoreboard. **Impostor** owns picking each round's impostor, the votes and the verdict. The obvious split would put estimates and the impostor pick in Rounds, since the deadline and the view live there; we chose otherwise so that Scoring and Impostor each own real data and real work instead of being thin calculators around a Rounds service that holds everything.

## Dependency graph

No cycles (ADR-0003). Each arrow reads "asks":

- **Games → Rounds**: to start each round of a game.
- **Rounds → Catalog**: to draw the round's question.
- **Rounds → Impostor**: when it creates a round, to pick its impostor among the candidates Rounds passes along; and, after an early close, to tell Impostor the round has closed.
- **Scoring → Rounds**: for a round's solution and effective deadline, to reject late estimates and score the rest.
- **Scoring → Impostor**: for a round's verdict, to turn it into points.
- **Scoring → Games**: about the players of a game.
- **Impostor** asks no other service.

The phone asks each service for its own view and composes the screen; that adds no arrow between services.

## Considered Options

- **Rounds owns estimates and picks the impostor.** Simplest for the single-writer rule, since the deadline lives in Rounds. Rejected to balance the work: Rounds would hold the round, the view, the estimates and the impostor, and Scoring and Impostor would have almost no service of their own.
- **Scoring owns estimates and Rounds shows them in its view.** Rejected: Rounds would ask Scoring and Scoring would ask Rounds, a cycle.
- **Impostor picks and asks Rounds for the phase.** Rejected for the same reason; Rounds hands Impostor everything it needs instead.

## Consequences

- Scoring keeps the estimates and asks Rounds only for solutions and deadlines.
- The rounds view carries no estimate: the round screen asks Scoring for the player's own estimate and how many have answered, and puts both together with the rounds view.
- A round becomes visible only after Impostor has picked its impostor and Rounds has stored who it is. If Impostor does not answer, the round does not open.
- Who the impostor is travels only between services, never through the gateway to a phone, until the verdict.
- Rounds tells Impostor when the host closes a round early, because Impostor never asks Rounds.
- Scoring computes the scoreboard on every read. It may keep copies of solutions of closed rounds and of verdicts, since they no longer change; they are copies, not data it owns.
