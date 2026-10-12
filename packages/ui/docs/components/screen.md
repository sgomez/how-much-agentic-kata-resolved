# Screen

The page shell: a 100dvh column, centred and capped at 480px, with a sticky top bar, a scrolling middle and a sticky bottom bar.

## Props

```ts
export interface ScreenProps {
  /** Usually a TopBar. Stays at the top; respects the notch. */
  top?: ReactNode;
  /** Usually a BottomActionBar. Stays in the thumb zone; respects the home indicator. */
  bottom?: ReactNode;
  /** A status strip right under the top bar: ConnectionBanner. It takes its own row, so it never covers the content. */
  banner?: ReactNode;
  /** Overlays that belong to the whole screen: Toast, BottomSheet. */
  overlays?: ReactNode;
  /** Centre the content vertically (home, nickname, error screens). */
  centered?: boolean;
  /** Tint the page with the brand yellow (home and final podium). Default plain surface. */
  tone?: "surface" | "primary";
  children: ReactNode;
}
```

## States

plain · centred content · yellow tone

## Guidelines

- Every composition starts here.
- banner holds ConnectionBanner: a row under the top bar, so it never covers the question.
- overlays holds Toast and BottomSheet so they stay inside the column.
- Safe areas are handled by TopBar and BottomActionBar.

## Example

```tsx
<Screen
  top={<TopBar gameCode="KQZT" />}
  bottom={<BottomActionBar>…</BottomActionBar>}
  banner={<ConnectionBanner status={net} />}
>
  …
</Screen>
```
