# Button

A labelled action; use one primary Button per screen and put it in BottomActionBar.

## Props

```ts
export interface ButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> {
  /** primary = the one main action of the screen (yellow). secondary = alternatives. ghost = low-emphasis. danger = destructive. Default primary. */
  variant?: ButtonVariant;
  /** md = 48px tall (default). lg = 56px, for the main action in BottomActionBar. */
  size?: "md" | "lg";
  /** Shows a spinner, keeps the label (no width jump) and blocks presses. */
  loading?: boolean;
  /** Stretches to the container width. */
  fullWidth?: boolean;
  /** Optional leading icon. */
  icon?: IconName;
  children: ReactNode;
}
```

## States

default · hover (pointer devices) · pressed (sinks into its shadow) · focus (3px focus ring) · disabled (sunken, muted, no shadow) · loading (spinner, label kept, presses ignored)

## Guidelines

- primary = the main action (yellow). secondary = an alternative. ghost = low emphasis (Salir, Ahora no). danger = destructive.
- size="lg" fullWidth for the action in BottomActionBar.
- Labels are verbs, sentence case, no full stop: Enviar, Empezar, Unirme.
- Disabled needs a reason: put it in BottomActionBar hint.

## Example

```tsx
<Button
  size="lg"
  fullWidth
  icon="send"
  disabled={value === null}
  onClick={send}
>
  Enviar
</Button>
```
