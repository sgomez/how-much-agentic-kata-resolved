# AvatarGroup

Overlapping avatars with a "+N" overflow and an accessible list of names.

## Props

```ts
export interface AvatarGroupProps {
  players: AvatarPlayer[];
  /** How many avatars to show before "+N". Default 5. */
  max?: number;
  size?: "sm" | "md";
  /** Optional per-player mark (e.g. answered). */
  markFor?: (player: AvatarPlayer) => AvatarProps["mark"] | undefined;
  className?: string;
}
```

## States

sm · md · with marks

## Example

```tsx
<AvatarGroup players={answered} max={4} />
```
