# Spinner

An indeterminate wait indicator in currentColor.

## Props

```ts
export interface SpinnerProps {
  /** Pixel size. Default 20. */
  size?: number;
  /** Read by screen readers. Default "Cargando". Pass "" when a parent already announces the wait. */
  label?: string;
  className?: string;
}
```

## States

sizes

## Guidelines

- Buttons have their own loading prop: do not put a Spinner inside a Button.

## Example

```tsx
<Spinner label="Uniéndote a la partida" />
```
