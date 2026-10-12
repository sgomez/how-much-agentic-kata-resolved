# RevealList

The reveal as text: estimates sorted by distance, the signed difference and the points.

## Props

```ts
export interface RevealListProps {
  unit: string;
  solution: number;
  entries: RevealListEntry[];
  youId?: string;
  /** Decimal step of the question, for formatting. Default 1. */
  step?: number;
}
```

## States

closest highlighted · exact · excluded section · no answer

## Example

```tsx
<RevealList
  unit={q.unit}
  solution={q.solution}
  entries={answers.map((a) => ({
    player: a.player,
    value: a.value,
    points: a.points,
    reason: a.reason,
  }))}
  youId={me.id}
/>
```
