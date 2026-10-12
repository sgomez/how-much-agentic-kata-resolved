# ConnectionBanner

A calm pill under the top bar while polling fails, then "Conectado" for 2 s when it recovers.

## Props

```ts
export interface ConnectionBannerProps {
  /** Feed it straight from your polling hook. When it goes back to "connected" it says "Conectado" for 2 s, then hides. */
  status: "connected" | "reconnecting";
}
```

## States

hidden · reconnecting · reconnected (2 s)

## Guidelines

- It never blocks the screen: render it in `Screen`'s `banner` slot, where it takes its own row under the top bar and pushes the content down instead of covering it. The player keeps their state and the game catches up on its own.
- Feed it from your polling hook; it handles the 2-second "Conectado" by itself.

## Example

```tsx
<ConnectionBanner status={lastPollOk ? "connected" : "reconnecting"} />
```
