import { useEffect, useId, useRef } from "react";
import type { ReactNode } from "react";

import { IconButton } from "./icon-button.tsx";

export interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Actions pinned at the bottom of the sheet (Buttons). */
  actions?: ReactNode;
}

/**
 * The mobile dialog: slides up from the bottom, scrim behind, Escape or scrim tap closes,
 * focus moves in and is kept inside while open, and returns to where it was on close.
 * Render it inside Screen.
 */
export const BottomSheet = ({
  open,
  onClose,
  title,
  children,
  actions,
}: BottomSheetProps) => {
  const id = useId();
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) {
      return;
    }
    const before = document.activeElement as HTMLElement | null;
    const el = panel.current;
    const focusables = () =>
      [
        ...(el?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) ?? []),
      ].filter((x) => !x.hasAttribute("disabled"));
    // Focus the sheet itself: never land on a destructive action by default.
    el?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
      if (e.key === "Tab") {
        const f = focusables();
        const [first] = f;
        const last = f.at(-1);
        if (first === undefined || last === undefined) {
          return;
        }
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      before?.focus?.();
    };
  }, [open, onClose]);
  if (!open) {
    return null;
  }
  return (
    <div className="absolute inset-0 z-(--z-sheet) flex flex-col justify-end">
      <div
        className="animate-fade bg-overlay absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={id}
        tabIndex={-1}
        // The panel only takes focus so the next Tab lands inside it; it is not a control, so no ring.
        className="max-w-app animate-sheet border-line bg-surface-raised shadow-sheet relative mx-auto flex max-h-[85%] w-full flex-col rounded-t-xl border-2 border-b-0 outline-none"
      >
        <div
          className="bg-line-subtle mx-auto mt-2 h-1.5 w-10 rounded-full"
          aria-hidden="true"
        />
        <div className="flex items-center justify-between gap-2 px-4 pt-2 pb-1">
          <h2
            id={id}
            className="font-display text-heading text-ink m-0 font-bold"
          >
            {title}
          </h2>
          <IconButton
            icon="close"
            label="Cerrar"
            variant="ghost"
            onClick={onClose}
          />
        </div>
        <div className="text-ink min-h-0 flex-1 overflow-y-auto px-4 pb-4">
          {children}
        </div>
        {actions ? (
          <div className="border-line-subtle flex flex-col gap-3 border-t-2 px-4 pt-3 pb-[calc(16px+env(safe-area-inset-bottom))]">
            {actions}
          </div>
        ) : (
          <div className="pb-[env(safe-area-inset-bottom)]" />
        )}
      </div>
    </div>
  );
};
