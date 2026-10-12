import { useRef, useState } from "react";

import { toMs, useAnimationFrame, useServerNow } from "../lib/clock.ts";
import type { ServerTime } from "../lib/clock.ts";
import { cx } from "../lib/cx.ts";
import { Icon } from "./icon.tsx";

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

const R = 19;
const C = 2 * Math.PI * R;

/** What the live region says: at 10 s, on each urgent second, and when time is up. */
const spokenFor = (secs: number, urgentAt: number): string => {
  if (secs === 10 || (secs > 0 && secs <= urgentAt)) {
    return secs === 1 ? "Queda 1 segundo" : `Quedan ${secs} segundos`;
  }
  return secs === 0 ? "Se acabó el tiempo" : "";
};

const CountdownBar = ({
  secs,
  duration,
  label,
  progressRef,
}: {
  secs: number;
  duration: number;
  label: string | undefined;
  progressRef: (el: HTMLDivElement | null) => void;
}) => (
  <div className="flex w-full flex-col gap-1.5">
    <div className="text-ink flex items-baseline justify-between text-sm font-bold">
      <span>{label}</span>
      <span className="condensed text-lg">{secs}&nbsp;s</span>
    </div>
    <div
      className="border-line bg-surface-sunken h-3 overflow-hidden rounded-full border-2"
      role="progressbar"
      aria-label={label ?? "Tiempo"}
      aria-valuemin={0}
      aria-valuemax={duration}
      aria-valuenow={secs}
      aria-valuetext={`${secs} segundos`}
    >
      <div
        ref={progressRef}
        className="bg-ink h-full origin-left will-change-transform"
      />
    </div>
  </div>
);

/**
 * Seconds left until endsAt, computed against server time. The ring is driven by requestAnimationFrame
 * through a ref, so a new poll (same endsAt) never restarts or flickers it; React only re-renders
 * when the whole second changes. Last 5 s: danger colour, a bolder number, a pulse, and spoken counts.
 */
export const Countdown = ({
  endsAt,
  serverNow,
  duration,
  variant = "ring",
  size = "sm",
  label,
  urgentAt = 5,
  onEnd,
}: CountdownProps) => {
  const now = useServerNow(serverNow);
  const end = toMs(endsAt);
  // On the first render "now" is the poll's serverNow; afterwards the server clock offset.
  const [secs, setSecs] = useState(() =>
    Math.ceil(Math.max(0, end - toMs(serverNow)) / 1000)
  );
  const progressEl = useRef<SVGCircleElement | HTMLDivElement | null>(null);
  const ended = useRef(false);
  const total = Math.max(1, duration) * 1000;

  useAnimationFrame(() => {
    const ms = Math.max(0, end - now());
    setSecs(Math.ceil(ms / 1000));
    const frac = Math.min(1, ms / total);
    const el = progressEl.current;
    if (el instanceof SVGCircleElement) {
      el.style.strokeDashoffset = String(C * (1 - frac));
    } else if (el) {
      el.style.transform = `scaleX(${frac})`;
    }
    if (ms > 0) {
      // A new deadline in the future (next round) arms onEnd again.
      ended.current = false;
    } else if (!ended.current) {
      ended.current = true;
      onEnd?.();
    }
  });

  const setProgressEl = (el: SVGCircleElement | HTMLDivElement | null) => {
    progressEl.current = el;
  };
  const urgent = secs <= urgentAt && secs > 0;
  const over = secs === 0;
  const spoken = spokenFor(secs, urgentAt);

  if (variant === "bar") {
    return (
      <CountdownBar
        secs={secs}
        duration={duration}
        label={label}
        progressRef={setProgressEl}
      />
    );
  }

  const big = size === "lg";
  const box = big ? 72 : 40;
  return (
    <div
      className={cx(
        "relative inline-flex shrink-0 items-center justify-center",
        urgent && "animate-urgent",
        big ? "size-18" : "size-10"
      )}
      role="timer"
      aria-label={over ? "Se acabó el tiempo" : `${secs} segundos`}
    >
      <svg
        width={box}
        height={box}
        viewBox="0 0 44 44"
        className="absolute inset-0 -rotate-90"
        aria-hidden="true"
      >
        <circle
          cx="22"
          cy="22"
          r={R}
          fill="none"
          strokeWidth="5"
          className="stroke-surface-sunken"
        />
        <circle
          ref={setProgressEl}
          cx="22"
          cy="22"
          r={R}
          fill="none"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={C}
          className={cx(
            "transition-[stroke] duration-(--duration-slow)",
            urgent || over ? "stroke-danger" : "stroke-ink"
          )}
        />
      </svg>
      {over ? (
        <Icon name="clock" size={big ? 28 : 18} className="text-danger-text" />
      ) : (
        <span
          className={cx(
            "condensed relative leading-none",
            big ? "text-title" : "text-lg",
            urgent ? "font-black text-danger-text" : "font-extrabold text-ink"
          )}
        >
          {secs}
        </span>
      )}
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {spoken}
      </span>
    </div>
  );
};
