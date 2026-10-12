# TopBar

The thin bar at the top of in-game screens: game code, round and countdown.

## Props

```ts
export interface TopBarProps {
  /** Game code, shown small so players can read it to latecomers. */
  gameCode?: string;
  /** Current round (1-based) and total; shows "Ronda 3 / 10". */
  round?: number;
  totalRounds?: number;
  /** Optional right-side slot: a Countdown size="sm", or an IconButton. */
  trailing?: ReactNode;
  /** Optional left-side slot before the code (e.g. a back IconButton). */
  leading?: ReactNode;
}
```

## States

code only · code + round · + countdown · + leading button

## Example

```tsx
<TopBar
  gameCode="KQZT"
  round={3}
  totalRounds={10}
  trailing={<Countdown endsAt={endsAt} serverNow={now} duration={30} />}
/>
```
