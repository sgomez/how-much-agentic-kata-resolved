# Stack

Lays children out in a column or row with a token gap; the only layout primitive besides Grid.

## Props

```ts
export interface StackProps {
  /** col (default) stacks vertically; row lays out horizontally. */
  direction?: "col" | "row";
  /** Gap in spacing steps (4 = 16px, default). */
  gap?: Gap;
  align?: "start" | "center" | "end" | "stretch" | "baseline";
  justify?: "start" | "center" | "end" | "between";
  /** Let row items wrap onto new lines. */
  wrap?: boolean;
  /** Take the remaining space in a parent Stack (flex-1, min-h-0 so inner scrolling works). */
  grow?: boolean;
  as?: "div" | "section" | "ul" | "ol" | "form" | "header" | "footer";
  className?: string;
  children: ReactNode;
}
```

## States

column · row · wrap · grow

## Guidelines

- gap is in spacing steps: 2 = 8px, 4 = 16px (default), 6 = 24px between sections.
- grow makes it fill the remaining height (the round screen uses it so the ruler gets all the space).

## Example

```tsx
<Stack gap={6}>
  <QuestionCard question={q.text} unit={q.unit} />
  <EstimateRuler … />
</Stack>
```
