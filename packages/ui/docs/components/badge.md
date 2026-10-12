# Badge

A short status label such as "Anfitrión", "Tú", "Enviado" or "Impostor".

## Props

```ts
export interface BadgeProps {
  /** Meaning of the badge. Pair any status tone with an icon or a clear word. Default neutral. */
  tone?: BadgeTone;
  icon?: IconName;
  /** soft (default) = tinted ground; solid = filled, for the one badge that must pop. */
  variant?: "soft" | "solid";
  className?: string;
  children: ReactNode;
}
```

## States

soft · solid × neutral · primary · accent · success · warning · danger · info

## Guidelines

- One or two words. Pair status tones with an icon.
- solid for the one badge that must pop (Enviado, Más cerca).

## Example

```tsx
<Badge tone="primary" icon="crown">
  Anfitrión
</Badge>
```
