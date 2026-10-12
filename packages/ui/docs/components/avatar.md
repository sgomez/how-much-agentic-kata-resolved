# Avatar

A player's initials on their stable player colour, with an optional corner mark.

## Props

```ts
export interface AvatarProps {
  /** The player. The colour comes from player.id (stable on every phone), the letters from player.name. */
  player: AvatarPlayer;
  /** sm 28 · md 40 (default) · lg 56 · xl 80 px. */
  size?: "sm" | "md" | "lg" | "xl";
  /** Small corner mark: answered ✓, host crown, offline. Always also said in text nearby or in the label. */
  mark?: "answered" | "host" | "offline";
  /** Dim it (disconnected players, eliminated options). */
  dimmed?: boolean;
  /** When the avatar stands alone (no visible name next to it), set this so it gets an accessible name. */
  labelled?: boolean;
  className?: string;
}
```

## States

sizes sm · md · lg · xl · marks answered · host · offline · dimmed

## Guidelines

- The colour comes from player.id, the same on every phone; the initials make it work without colour.
- labelled when the avatar stands alone (no visible name next to it).

## Example

```tsx
<Avatar player={{ id: p.id, name: p.name }} mark="host" />
```
