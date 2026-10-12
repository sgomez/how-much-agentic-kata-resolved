# IconButton

A square icon-only button that always carries an accessible label.

## Props

```ts
export interface IconButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "aria-label"
> {
  icon: IconName;
  /** Required accessible name, also shown as the tooltip ("Copiar código"). */
  label: string;
  /** secondary (default) = outlined sticker; ghost = no border, for bars; primary = yellow. */
  variant?: "primary" | "secondary" | "ghost";
  /** md = 44px (default, minimum touch size). lg = 56px. */
  size?: "md" | "lg";
}
```

## States

default · hover · pressed · focus · disabled

## Guidelines

- label is required and shown as the tooltip.
- 44px minimum (md); 56px (lg).
- Do not use for the screen's main action: that is a Button with text.

## Example

```tsx
<IconButton icon="copy" label="Copiar código" onClick={copy} />
```
