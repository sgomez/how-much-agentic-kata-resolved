# Card

A container that groups related content on a raised, sunken, yellow or pink ground.

## Props

```ts
export interface CardProps {
  /** raised (default) = white sticker card · sunken = well for read-only info · primary = yellow highlight · accent = pink highlight. */
  tone?: "raised" | "sunken" | "primary" | "accent";
  /** Inner padding. md = 16px (default), lg = 24px, none = edge-to-edge content (lists). */
  padding?: "none" | "md" | "lg";
  as?: "div" | "section" | "article";
  className?: string;
  children: ReactNode;
  "aria-label"?: string;
  "aria-labelledby"?: string;
}
```

## States

raised · sunken · primary · accent

## Guidelines

- raised = interactive or important content (sticker look). sunken = read-only info.
- primary and accent are highlights: one per screen.

## Example

```tsx
<Card tone="sunken">
  <Text>Las respuestas se ven al final de la ronda.</Text>
</Card>
```
