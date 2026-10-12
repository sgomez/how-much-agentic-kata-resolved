import type { ReactNode } from "react";

import { cx } from "../lib/cx.ts";

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

/**
 * The page shell every composition starts from: a full-height (100dvh) column, centred and capped at
 * 480px on tablets and laptops, with a scrolling middle between a top bar and a sticky bottom bar.
 */
export const Screen = ({
  top,
  bottom,
  banner,
  overlays,
  centered,
  tone = "surface",
  children,
}: ScreenProps) => (
  <div
    className={cx(
      "min-h-(--screen-h,100dvh) w-full",
      tone === "primary"
        ? "bg-primary"
        : "bg-surface-sunken md:bg-surface-sunken"
    )}
  >
    <div
      className={cx(
        "relative mx-auto flex h-(--screen-h,100dvh) w-full max-w-app flex-col overflow-hidden text-ink",
        tone === "primary" ? "bg-primary" : "bg-surface",
        "md:border-x-2 md:border-line-subtle"
      )}
    >
      {top}
      {banner}
      <main
        className={cx(
          "flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-4 pt-4 pb-6",
          centered && "justify-center"
        )}
      >
        {children}
      </main>
      {bottom}
      {overlays}
    </div>
  </div>
);
