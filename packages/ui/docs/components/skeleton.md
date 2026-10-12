# Skeleton

A placeholder shown only until the first poll arrives.

## Props

```ts
export interface SkeletonProps {
  /** text = lines of copy (use lines), circle = avatar, block = card or button area. Default text. */
  shape?: "text" | "circle" | "block";
  /** Number of text lines. Default 1; the last of several is shorter. */
  lines?: number;
  /** CSS width/height for circle and block, e.g. 40 or "100%". */
  width?: number | string;
  height?: number | string;
  className?: string;
}
```

## States

text lines · circle · block

## Guidelines

- Never show skeletons on later polls: keep the last value on screen instead.

## Example

```tsx
<Skeleton shape="circle" />
<Skeleton lines={2} />
```
