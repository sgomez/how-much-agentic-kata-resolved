import { useEffect, useRef, useState } from "react";

import { cx } from "../lib/cx.ts";
import { Icon } from "./icon.tsx";
import { Spinner } from "./spinner.tsx";

export interface ConnectionBannerProps {
  /** Feed it straight from your polling hook. When it goes back to "connected" it says "Conectado" for 2 s, then hides. */
  status: "connected" | "reconnecting";
}

/**
 * A calm pill under the top bar while polling fails. It never blocks the screen: it takes its own
 * row (the content moves down instead of hiding under it), the player keeps their state, and the
 * game catches up on its own. Render it in Screen's banner slot.
 */
export const ConnectionBanner = ({ status }: ConnectionBannerProps) => {
  const prev = useRef(status);
  const [justBack, setJustBack] = useState(false);
  useEffect(() => {
    if (prev.current === "reconnecting" && status === "connected") {
      setJustBack(true);
      const t = window.setTimeout(() => setJustBack(false), 2000);
      prev.current = status;
      return () => window.clearTimeout(t);
    }
    prev.current = status;
    setJustBack(false);
  }, [status]);
  const show = status === "reconnecting" || justBack;
  return (
    <div
      role="status"
      aria-live="polite"
      className={cx("flex shrink-0 justify-center px-4", show && "pt-3")}
    >
      {show ? (
        <span
          className={cx(
            "inline-flex animate-rise items-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-bold",
            status === "reconnecting"
              ? "border-warning bg-warning-soft text-warning-text"
              : "border-success bg-success-soft text-success-text"
          )}
        >
          {status === "reconnecting" ? (
            <Spinner size={16} label="" />
          ) : (
            <Icon name="check" size={16} />
          )}
          {status === "reconnecting" ? "Reconectando…" : "Conectado"}
        </span>
      ) : null}
    </div>
  );
};
