# Scoreboard

The ranking: position, avatar, name, total and this round's delta; ties share a position and rows glide when they reorder.

## Props

```ts
export interface ScoreboardProps {
  rows: ScoreRow[];
  youId?: string;
  /** Start numbering from here (FinalPodium passes 4 for "the rest"). Default 1. */
  startRank?: number;
}
```

## States

after a round (deltas, movement) · final (no deltas) · all zero

## Guidelines

- Pass previousRank to show "Sube 2" / "Baja 1".
- Reordering uses FLIP and is off under reduced motion.

## Example

```tsx
<Scoreboard
  rows={players.map((p) => ({
    id: p.id,
    name: p.name,
    score: p.total,
    delta: p.round,
    previousRank: p.prevRank,
  }))}
  youId={me.id}
/>
```
