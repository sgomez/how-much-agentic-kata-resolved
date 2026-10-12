# RevealRuler

Read-only reveal: the solution and every estimate as an avatar on a ruler zoomed to where the answers fell.

## Props

```ts
export interface RevealRulerProps {
  min: number;
  max: number;
  unit: string;
  scale?: ScaleKind | "auto";
  step?: number;
  /** The right answer. */
  solution: number;
  estimates: RevealEstimate[];
  /** Height of the chart in px. Default 340. */
  height?: number;
}
```

## States

spread · crowded (beeswarm + "+N") · excluded impostor · exact hit · tie · no answers

## Guidelines

- Separate from EstimateRuler on purpose: different inputs, no interaction, different geometry; same scale engine.
- Pass value null for players who did not answer; pass excluded for an impostor who does not compete; leave an entry out to hide it.

## Example

```tsx
<RevealRuler
  min={q.min}
  max={q.max}
  unit={q.unit}
  solution={q.solution}
  estimates={answers.map((a) => ({ player: a.player, value: a.value }))}
/>
```
