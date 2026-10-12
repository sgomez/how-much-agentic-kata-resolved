# Scoring

Keeps the players' estimates and turns them, together with the impostor verdicts, into points.

## Language

### Estimates

**Estimate**: The number a player sends for a round before its deadline. A player who sends nothing has no estimate, and scores nothing for it. _Avoid_: Answer, guess

**Closest estimate**: An estimate with the smallest absolute difference from the solution. Every estimate tied at that difference is a closest estimate. _Avoid_: Best guess, winner

**Exact hit**: An estimate exactly equal to the solution, with no tolerance. _Avoid_: Bullseye, perfect answer

### Points

**Points**: What a player wins in one round: 3 for a closest estimate, 2 more for an exact hit, and 5 for an impostor who escaped, counted only once the verdict exists. Catching the impostor earns nothing. _Avoid_: Score (for a single round)

**Score**: The sum of a player's points over a game. _Avoid_: Total, points (for the sum)

**Scoreboard**: Every player's score in a game, worked out afresh each time someone looks at it. _Avoid_: Ranking, leaderboard, standings

### Borrowed terms

**Solution**: As defined by the [Catalog](../catalog/GLOSSARY.md).

**Deadline**: As defined by [Rounds](../rounds/GLOSSARY.md). A number sent after it is not an estimate.

**Verdict**, **Escaped**: As defined by [Impostor](../impostor/GLOSSARY.md). Scoring only turns them into points.
