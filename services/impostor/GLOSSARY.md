# Impostor

Runs impostor mode: picks the impostor of each round, collects the votes and decides the verdict.

## Language

**Impostor**: A player's role in one round of an impostor game: the one player who sees the unit but not the question. No player is the impostor in two consecutive rounds. _Avoid_: Spy, traitor, blind player

### Voting

**Vote**: One player's final choice of who the impostor of a round was. Every player votes, the impostor included, and nobody votes for themselves. _Avoid_: Accusation, guess

**Suspect**: The player a vote points at. _Avoid_: Accused, target

### Verdict

**Verdict**: The outcome of the vote on one round's impostor: either caught or escaped. Until the verdict, nobody else learns who the impostor was or who voted for whom. _Avoid_: Result, outcome

**Caught**: The verdict when the impostor has more votes than any other player. _Avoid_: Found, unmasked

**Escaped**: The verdict when the impostor is not caught, including a tie for the most votes. _Avoid_: Survived, not found
