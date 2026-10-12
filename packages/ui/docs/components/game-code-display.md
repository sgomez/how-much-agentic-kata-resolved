# GameCodeDisplay

The game code, huge and spaced, with copy and share, legible from across a table.

## Props

```ts
export interface GameCodeDisplayProps {
  code: string;
  /** Link that "Compartir" sends (your join URL). Share is hidden when the browser cannot share. */
  shareUrl?: string;
  /** Called after a successful copy, e.g. to show a Toast. The button also confirms with a check. */
  onCopied?: () => void;
}
```

## States

default · copied (check for 1,5 s) · share hidden where unsupported · 4–6 characters

## Guidelines

- Screen readers hear it spelled out ("K Q Z T").

## Example

```tsx
<GameCodeDisplay
  code="KQZT"
  shareUrl={`${origin}/s/KQZT`}
  onCopied={() => setToast(true)}
/>
```
