# AnswerTracker

"7 de 12 han respondido" with avatars of who answered; never shows values.

## Props

```ts
export interface AnswerTrackerProps {
  players: { id: string; name: string; answered: boolean }[];
  /** One line for tight screens (the round screen): the count plus the first answered avatars. */
  compact?: boolean;
}
```

## States

some answered · all answered · compact (one line, for the round screen)

## Example

```tsx
<AnswerTracker
  players={players.map((p) => ({
    id: p.id,
    name: p.name,
    answered: p.answered,
  }))}
  compact
/>
```
