# BottomSheet

The mobile dialog: slides up, scrim behind, Escape or a scrim tap closes, focus trapped and restored.

## Props

```ts
export interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Actions pinned at the bottom of the sheet (Buttons). */
  actions?: ReactNode;
}
```

## States

closed · open

## Guidelines

- Render it in Screen overlays.
- Focus lands on the sheet itself, never on a destructive button.

## Example

```tsx
<BottomSheet
  open={open}
  onClose={close}
  title="¿Salir de la partida?"
  actions={
    <Button variant="danger" fullWidth>
      Salir
    </Button>
  }
>
  …
</BottomSheet>
```
