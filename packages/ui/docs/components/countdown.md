# Countdown

Seconds left until endsAt, computed against the server's clock, as a ring or a bar.

## Props

```ts
export interface CountdownProps {
  /** Absolute deadline from the server (epoch ms or ISO). */
  endsAt: ServerTime;
  /** The server's current time from the same poll. The phone's clock is never trusted on its own. */
  serverNow: ServerTime;
  /** Total length in seconds, for the ring/bar proportion (seconds per round). */
  duration: number;
  /** ring (default) for the TopBar, bar for "Siguiente ronda en…". */
  variant?: "ring" | "bar";
  /** ring only: sm 40px (TopBar, default) or lg 72px. */
  size?: "sm" | "lg";
  /** bar only: label before the seconds ("Siguiente ronda en"). */
  label?: string;
  /** Seconds at which it turns urgent. Default 5. */
  urgentAt?: number;
  /** Called once when it reaches 0. */
  onEnd?: () => void;
}
```

## States

running · urgent (last 5 s: danger colour, heavier number, pulse, spoken count) · ended · bar with label

## Guidelines

- Pass endsAt and serverNow straight from each poll. The offset to server time is only adopted when it drifts more than 250 ms, and the ring is driven by requestAnimationFrame, so polls never restart or jump it.
- Spoken at 10 s and each of the last 5 seconds.
- Use variant="bar" for "Siguiente ronda en".

## Example

```tsx
<Countdown
  endsAt={round.endsAt}
  serverNow={state.serverNow}
  duration={settings.seconds}
/>
```
