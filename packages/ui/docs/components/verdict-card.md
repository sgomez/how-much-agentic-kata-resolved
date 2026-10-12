# VerdictCard

Reveals who the impostor was and whether the players caught them, optionally with every vote.

## Props

```ts
export interface VerdictCardProps {
  /** caught = most votes went to the impostor · escaped = not caught · none = no verdict (tie, when your rules say so). */
  outcome: "caught" | "escaped" | "none";
  impostor: { id: string; name: string };
  /** Points the impostor gets (5 when escaped, 0 when caught). Omit to hide. */
  impostorPoints?: number;
  /** Optional: who voted for whom. Leave out for the "only the verdict" variant. */
  votes?: VoteRecord[];
  /** Short reason line for 'none' or ties ("Empate a 3 votos"). */
  detail?: string;
}
```

## States

caught · escaped · no verdict · with votes · with detail (ties)

## Example

```tsx
<VerdictCard
  outcome="escaped"
  impostor={imp}
  impostorPoints={5}
  votes={showVotes ? votes : undefined}
/>
```
