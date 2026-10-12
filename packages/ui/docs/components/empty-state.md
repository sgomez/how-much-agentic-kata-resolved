# EmptyState

A centred icon, title, help text and optional action for empty lists and error screens.

## Props

```ts
export interface EmptyStateProps {
  icon?: IconName;
  /** One short line: "Aún no hay nadie". */
  title: string;
  /** What happens next or what to do: "Comparte el código para que se unan". */
  description?: ReactNode;
  /** tone of the icon disc. danger for errors (unknown game, game closed). Default neutral. */
  tone?: "neutral" | "danger" | "warning";
  /** Optional action, usually a Button. */
  action?: ReactNode;
  className?: string;
}
```

## States

neutral · warning · danger

## Guidelines

- Title says what happened; description says what to do next.
- Error screens: tone="danger" plus a "Volver al inicio" action in BottomActionBar.

## Example

```tsx
<EmptyState
  icon="alert"
  tone="danger"
  title="Esa partida no existe"
  description="Revisa el código con quien la creó."
/>
```
