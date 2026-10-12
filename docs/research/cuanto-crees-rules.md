# Research: the rules of Cuánto Crees

> **Question:** What are the exact rules of the original game Cuánto Crees (scoring, ties and impostor mode), and where does this kata depart from them?
>
> Produced with `/research` before the workshop, so the plenary starts from facts. Sources read on 2026-10-12. Every claim cites its source; quotes are in Spanish, as on the site. This file reports facts, not decisions: the decisions belong to the groups in the plenary (`/grill-with-docs`).

## Sources

- [R] Rules page: <https://cuantocrees.com/reglas>
- [H] Home page: <https://cuantocrees.com/>
- [F] FAQ: <https://cuantocrees.com/preguntas-frecuentes>
- [A] This repository's acceptance tests: `acceptance/cases/`

## The original game

### Setup and players

- 2 to 10 players ("entre 2 y 10 personas"); with more than ten, they play in pairs. [R] [F]
- **One phone passed from hand to hand**: each player sets their number in secret and passes the phone on. [H] [F]
- Before starting, the group enters the players' names and chooses which **packs** of questions are on. Impostor mode is switched on in the settings and announced before starting. [R] [H]
- There are no other settings: no number of rounds, no round time. [R]

### Rounds

- Each round is one question whose answer is a number with a unit. [H] [F]
- A round ends when everyone has bet. **There is no timer** in the original. [R]
- Groups usually play 5 to 10 rounds; the game stops whenever the group wants ("Se corta cuando queráis"). [H] [R]
- Questions do not repeat until the deck of the active packs is exhausted. [F]

### The ruler (the "wheel")

- Players pick their number on a wheel whose scale is **not linear**: each step multiplies rather than adds, so the same wheel can reach 12 or 12,000. [R]
- The starting point changes with each question, and the centre is not a hint. Players can fine-tune with − and +, or type the number. [R]
- The game rewards getting close in order of magnitude, not decimal precision. [F]

### Reveal

- All numbers appear at once on a line, with the solution highlighted, showing who went over or under and by how much. [H] [R]

### Scoring

- **Closest: 3 points. Second closest: 2. Third closest: 1.** [R]
- **An exact answer adds 2 points** on top of the placement points ("+2 adicionales"). [R] [H]
- **Only distance counts**: going over and going under are the same ("solo cuenta la distancia"). [R]
- **Ties** (same distance or same number) score exactly the same; the order in the list does not matter. [R] [H]
- Points add up after each round, and the scoreboard is checked before the next one. [R]
- The player with the most points when the group stops wins. [R]

### Impostor mode

- Each round, **one player at random** is the impostor. [R]
- The impostor **does not see the question, only the unit** ("en metros", "en años") and must bet a number that does not stand out. [R] [H]
- In impostor rounds, **the numbers are revealed first without the solution**; the group discusses and **votes for one person**. [R]
- **Caught:** the impostor scores 0 and **every other player gets 2 extra points** on top of their placement points. [R]
- **Not caught:** the impostor scores **5 points**. [R] [H]

### What the rules do not say

[R] leaves these open: what counts as "caught" when the vote ties; whether someone can abstain; how long the discussion lasts; whether the impostor can win placement or exact points; tie-breaks for first place in the final ranking.

## Where the kata departs, and what the acceptance tests require

The online kata cannot be a copy: every player has their own phone and the server keeps time. The acceptance tests [A] fix the minimum:

| Rule | Original | Kata acceptance tests |
| --- | --- | --- |
| Devices | One phone passed around | One phone per player, joined with a game code |
| Round end | When everyone has bet | A deadline decided by the server |
| Closest | 3 points | 3 points ("the closest estimate scores 3 points") |
| Exact | +2 | +2 ("an exact estimate scores 3 plus 2 points") |
| Ties | Same points | Same points (estimates at the same absolute distance) |
| 2nd and 3rd place | 2 and 1 points | 0 points: only the closest scores ("the closest estimate scores 3 points" expects `{ ana: 3, eva: 0, luis: 0 }`) |
| Impostor escapes | 5 points | 5 points ("an impostor nobody votes for scores 5 points") |
| Impostor caught | 0 for them, +2 for everyone else | Only "gets nothing for the vote" is tested; nothing about the others |
| Reveal before the vote | Numbers without the solution | Not tested |
| Number of rounds, round time | No such settings | Game settings (see the glossary draft) |

## Questions this raises for the plenary

These are for the groups to decide; the research only shows where the original and the tests leave room.

1. When the impostor is caught, do the other players get 2 extra points?
2. In impostor rounds, is the solution hidden until after the vote, as in the original?
3. What counts as caught when the vote ties?
4. Does the impostor's estimate compete for placement and exact points?
5. The ruler is logarithmic in the original. Is it in ours, for every question?
