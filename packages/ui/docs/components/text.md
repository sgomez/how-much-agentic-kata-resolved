# Text

Body text in the text face with a size and a colour role.

## Props

```ts
export interface TextProps {
  /** lg 18 · base 16 (default) · sm 14 · xs 12 (bold caps-friendly). */
  size?: "lg" | "base" | "sm" | "xs";
  /** Colour role. muted for hints; the status tones for short messages that also carry an icon or word. */
  tone?: TextTone;
  weight?: "regular" | "bold";
  align?: "start" | "center";
  /** Element to render. Default p. */
  as?: "p" | "span" | "div" | "label" | "strong";
  className?: string;
  children: ReactNode;
  id?: string;
}
```

## States

tones: default · muted · accent · success · warning · danger · info

## Guidelines

- Status tones always come with an icon or a clear word.
- xs (12px, bold) is the smallest size anywhere.

## Example

```tsx
<Text size="sm" tone="muted">
  7 de 12 han respondido
</Text>
```
