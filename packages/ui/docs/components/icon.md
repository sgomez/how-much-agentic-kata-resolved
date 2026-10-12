# Icon

One glyph from the system's 35-icon line set, drawn in currentColor.

## Props

```ts
export interface IconProps {
  /** Which glyph. See iconNames for the full set (35). */
  name: IconName;
  /** Pixel size of the square. Default 20; 24 in buttons of size lg. */
  size?: number;
  /** Accessible name. Omit when the icon sits next to text that already says it (it is then hidden). */
  label?: string;
  className?: string;
}
```

## States

decorative (aria-hidden) · labelled (role img)

## Guidelines

- Next to text, leave label out. Alone, pass label (or use IconButton).
- Sizes: 14–16 in badges, 20 default, 22–24 in large buttons.
- Names: check close plus minus copy share crown user users clock wifi-off refresh chevron-left/right/up/down arrow-up/down/right trophy mask eye-off send play alert info lock pencil sparkle target log-out question ruler flag vote.

## Example

```tsx
<Icon name="crown" size={16} />
```
