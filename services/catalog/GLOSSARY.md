# Catalog

The question bank. It knows every question, groups them in packs, and remembers which questions each game has already drawn so none repeats.

## Language

### Questions

**Question**: A prompt whose answer is a single number, together with its unit and its ruler range. _Avoid_: Card, item, quiz

**Solution**: The true number that answers a question. _Avoid_: Answer, result, correct value

**Unit**: What the solution counts or measures (kilometres, people, years). It is part of the question but makes sense on its own. _Avoid_: Measure, magnitude

**Ruler range**: The lowest and highest number the estimate ruler offers for a question. It always contains the solution. _Avoid_: Bounds, limits, min/max

### Packs and decks

**Pack**: A named, themed group of questions that a host can enable for a game. _Avoid_: Category, set, theme

**Deck**: The questions one game has already drawn. A game never draws the same question twice. _Avoid_: History, pool

**Draw**: Taking, at random, a question the game has not seen yet from its enabled packs. _Avoid_: Pick, fetch, next

**Exhausted deck**: A deck that has drawn every question in its game's enabled packs; nothing more can be drawn. _Avoid_: Empty deck

### Borrowed terms

**Game**: Not defined here. The catalog only receives a game's identifier to keep one deck per game. See the [game glossary draft](../../docs/game-glossary-draft.md).
