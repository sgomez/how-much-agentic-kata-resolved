# Game glossary (DRAFT, to be resolved in the plenary)

> **This is a draft, not a glossary.** It collects the words every group will use and leaves the hard calls open on purpose. Resolve each open question with `/grill-with-docs`, then move the resolved term into the `GLOSSARY.md` of the service that owns it (see [GLOSSARY-MAP.md](../GLOSSARY-MAP.md)) and delete it from here. Until a term is resolved, do not build on any one reading of it.

Resolved in the plenary and moved to the service glossaries; ownership in ADR-0006. What follows is still open. Items marked **(fair)** go to the fair, where the groups involved settle them face to face.

## Games

**Host leaves**: Can the host change? What happens if the host's phone dies mid-game?

**Repeated nickname**: Is a nickname unique within a game? The games group leans towards "unique; a player whose nickname is already taken cannot join", but has not settled it.

**Settings**: How many rounds, how long each lasts, which packs and whether impostor mode is on. Who chooses them, and can they change once players are in the lobby? Not asked in the plenary.

**Current round**: Which round a game is on right now, and who keeps track of it. Not asked in the plenary.

**Starting a round (fair, with Rounds)**: What Games sends Rounds when it starts a round, and how Rounds learns whether the game is in impostor mode.

## Scoring

**Changing an estimate (fair)**: Can a player change their estimate before the deadline?

**Nicknames on the scoreboard (fair, with Games)**: Where Scoring gets the players' nicknames from.

**The impostor's estimate (fair, with Impostor)**: Is it in the race for the closest estimate? The scoring group proposes that it competes like any other.

## Impostor

**Impostor twice in a row**: Can the same player be the impostor in two consecutive rounds? The impostor group card leaves it for "if time allows".

**Opening and closing the vote (fair, with Rounds)**: How Impostor knows when to open the vote without asking Rounds, and when the vote closes. The impostor group proposes opening it when the deadline passes and closing it when everyone has voted. Is there a time limit for voting?
