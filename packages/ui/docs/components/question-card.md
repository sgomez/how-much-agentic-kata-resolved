# QuestionCard

The round's question and unit, or the impostor's unit-only version.

## Props

```ts
export interface QuestionCardProps {
  /** The question text. Ignored when impostor is true. */
  question?: string;
  /** Unit of the answer: "km", "personas", "habitantes por km²". */
  unit: string;
  /** Impostor view: only the unit, plus a quiet "Eres el impostor". Same size and colour as a normal card so a glance from the side gives nothing away. */
  impostor?: boolean;
}
```

## States

question · long unit · impostor

## Guidelines

- The impostor variant keeps the same size and colours, so a neighbour's glance gives nothing away: the question becomes blank bars and a small "Eres el impostor. Disimula." line.

## Example

```tsx
<QuestionCard question={q.text} unit={q.unit} impostor={me.isImpostor} />
```
