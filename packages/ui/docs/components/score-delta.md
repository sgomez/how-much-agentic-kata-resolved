# ScoreDelta

Points won this round: "+3", "+2 ¡exacto!", "+5 impostor", "+1 ¡pillado!".

## Props

```ts
export interface ScoreDeltaProps {
  points: number;
  /** Why: closest "+3" · exact "+2 ¡exacto!" · impostor "+5 impostor" · caught "+1 ¡pillado!". Omit for a plain number. */
  reason?: ScoreReason;
  size?: "sm" | "md";
  /** Pop in when it first appears (only on mount, never on re-render). Default true. */
  animate?: boolean;
}
```

## States

closest · exact · impostor · caught · zero (quiet) · sm/md

## Guidelines

- It pops in once on mount; re-renders with the same value do not replay it.

## Example

```tsx
<ScoreDelta points={2} reason="exact" />
```
