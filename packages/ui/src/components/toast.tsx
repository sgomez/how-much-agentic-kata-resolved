import { useEffect } from "react";

import { cx } from "../lib/cx.ts";
import { Icon } from "./icon.tsx";
import type { IconName } from "./icon.tsx";

export interface ToastProps {
  /** Show or hide. The live region stays mounted so screen readers hear every message. */
  open: boolean;
  message: string;
  /** info (default) · success · warning · danger. Each has its own icon. */
  tone?: "info" | "success" | "warning" | "danger";
  /** Called when it should close (after duration, or on tap). */
  onClose?: () => void;
  /** Milliseconds before onClose. Default 3000. 0 = stays until closed. */
  duration?: number;
}

const tones: Record<
  NonNullable<ToastProps["tone"]>,
  { cls: string; icon: IconName }
> = {
  info: { cls: "bg-ink text-surface", icon: "info" },
  success: { cls: "bg-success text-on-success", icon: "check" },
  warning: { cls: "bg-warning text-on-warning", icon: "alert" },
  danger: { cls: "bg-danger text-on-danger", icon: "alert" },
};

/**
 * A short message floating above the bottom bar ("Código copiado", "Lucía es ahora la anfitriona").
 * Render it inside Screen. Announced politely.
 */
export const Toast = ({
  open,
  message,
  tone = "info",
  onClose,
  duration = 3000,
}: ToastProps) => {
  useEffect(() => {
    // A new message restarts the timer.
    if (!open || !duration || !onClose || message === "") {
      return;
    }
    const t = window.setTimeout(onClose, duration);
    return () => window.clearTimeout(t);
  }, [open, duration, onClose, message]);
  const t = tones[tone];
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none absolute inset-x-0 bottom-[calc(96px+env(safe-area-inset-bottom))] z-(--z-toast) flex justify-center px-4"
    >
      {open ? (
        <button
          type="button"
          onClick={onClose}
          className={cx(
            "pointer-events-auto flex max-w-full animate-rise items-center gap-2 rounded-md px-4 py-3 text-left font-bold shadow-float",
            t.cls
          )}
        >
          <Icon name={t.icon} size={20} />
          <span>{message}</span>
        </button>
      ) : null}
    </div>
  );
};
