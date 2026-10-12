# BottomActionBar

The sticky bottom bar in the thumb zone for the screen's main action, safe-area aware.

## Props

```ts
export interface BottomActionBarProps {
  /** One primary Button (size lg, fullWidth), optionally a secondary one above or beside it. */
  children: ReactNode;
  /** One short line above the buttons: why it is disabled, or what happens next. Announced politely. */
  hint?: ReactNode;
}
```

## States

with action · with hint · empty (players waiting for the host)

## Guidelines

- hint is announced politely: use it for the reason a button is disabled or for what happens next.

## Example

```tsx
<BottomActionBar hint="Hacen falta al menos 3 jugadores (sois 2)">
  <Button size="lg" fullWidth disabled icon="play">
    Empezar
  </Button>
</BottomActionBar>
```
