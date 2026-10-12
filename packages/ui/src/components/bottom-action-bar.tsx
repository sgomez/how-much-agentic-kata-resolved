import type { ReactNode } from "react";

export interface BottomActionBarProps {
  /** One primary Button (size lg, fullWidth), optionally a secondary one above or beside it. */
  children: ReactNode;
  /** One short line above the buttons: why it is disabled, or what happens next. Announced politely. */
  hint?: ReactNode;
}

/** Sticky bottom bar in the thumb zone for the screen's main action. Safe-area aware. */
export const BottomActionBar = ({ children, hint }: BottomActionBarProps) => (
  <footer className="border-line-subtle bg-surface-raised z-(--z-bar) shrink-0 border-t-2 px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))]">
    <div
      aria-live="polite"
      className="text-ink-muted mb-2 text-center text-sm empty:hidden"
    >
      {hint}
    </div>
    <div className="flex flex-col gap-3">{children}</div>
  </footer>
);
