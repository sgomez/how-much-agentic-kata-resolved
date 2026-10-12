# FinalPodium

The end of the game: the top three on podium steps (ties share a step height) and everyone else ranked below.

## Props

```ts
export interface FinalPodiumProps {
  players: { id: string; name: string; score: number }[];
  youId?: string;
}
```

## States

3+ players · tie for first · 2 players

## Example

```tsx
<FinalPodium
  players={players.map((p) => ({ id: p.id, name: p.name, score: p.total }))}
  youId={me.id}
/>
```
