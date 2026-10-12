# Heading

A heading in the display face; level sets the outline, size the look.

## Props

```ts
export interface HeadingProps {
  /** Document outline level: 1 = screen title, 2 = section, 3 = sub-section. Default 2. */
  level?: 1 | 2 | 3;
  /** Visual size, independent of level. Default follows level: 1 → title, 2 → heading, 3 → lg. display = hero (verdict, podium, error screens). */
  size?: "display" | "title" | "heading" | "lg";
  align?: "start" | "center";
  className?: string;
  children: ReactNode;
}
```

## States

display · title · heading · lg

## Guidelines

- One level 1 per screen.
- size="display" only for hero moments: verdict, podium, error screens.

## Example

```tsx
<Heading level={1}>¿Quién era el impostor?</Heading>
```
