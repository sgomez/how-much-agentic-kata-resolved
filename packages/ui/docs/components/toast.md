# Toast

A short message floating above the bottom bar, announced politely.

## Props

```ts
export interface ToastProps {
  /** Show or hide. The live region stays mounted so screen readers hear every message. */
  open: boolean;
  message: string;
  /** info (default) · success · warning · danger. Each has its own icon. */
  tone?: "info" | "success" | "warning" | "danger";
  /** Called when it should close (after duration, or on tap). */
  onClose?: () => void;
  /** Milliseconds before onClose. Default 3000. 0 = stays until closed. */
  duration?: number;
}
```

## States

info · success · warning · danger · auto-dismiss · sticky (duration 0)

## Guidelines

- Render it in Screen overlays.
- For things that happened (Código copiado, Lucía es ahora la anfitriona), not for errors that need action.

## Example

```tsx
<Screen
  overlays={
    <Toast
      open={open}
      tone="success"
      message="Código copiado"
      onClose={() => setOpen(false)}
    />
  }
>
  …
</Screen>
```
