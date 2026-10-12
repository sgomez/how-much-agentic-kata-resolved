# Grid

Equal-width tiles in 2 or 3 columns.

## Props

```ts
export interface GridProps {
  /** Number of equal columns. Default 2. */
  cols?: 2 | 3;
  gap?: 2 | 3 | 4;
  as?: "div" | "ul";
  className?: string;
  children: ReactNode;
}
```

## States

2 cols · 3 cols

## Guidelines

- Use it for VoteOption tiles.

## Example

```tsx
<Grid cols={2}>
  {players.map((p) => (
    <VoteOption key={p.id} player={p} />
  ))}
</Grid>
```
