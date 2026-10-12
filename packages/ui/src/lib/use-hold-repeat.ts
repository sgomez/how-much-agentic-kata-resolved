import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import type { MouseEvent, PointerEvent } from "react";

/**
 * Press-and-hold repeat with acceleration for −/+ buttons.
 * First action on press, then after 400 ms it repeats every 150 ms, speeding up to every 40 ms.
 * `fn(multiplier)` gets 1 for the first 12 repeats, then 10 (big jumps once you clearly mean it).
 * Keyboard users get one action per Enter/Space via onClick (event.detail === 0).
 */
export const useHoldRepeat = (
  fn: (multiplier: number) => void,
  disabled = false
) => {
  const timer = useRef<number | null>(null);
  const count = useRef(0);
  const latest = useRef(fn);
  useLayoutEffect(() => {
    latest.current = fn;
  });

  const stop = useCallback(() => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);
  useEffect(() => stop, [stop]);

  const start = useCallback(() => {
    const repeat = (delay: number) => {
      timer.current = window.setTimeout(() => {
        count.current += 1;
        latest.current(count.current > 12 ? 10 : 1);
        repeat(Math.max(40, delay * 0.85));
      }, delay);
    };
    stop();
    count.current = 0;
    latest.current(1);
    timer.current = window.setTimeout(() => repeat(150), 400);
  }, [stop]);

  return {
    onPointerDown: (event: PointerEvent) => {
      if (disabled || event.button !== 0) {
        return;
      }
      event.preventDefault();
      start();
    },
    onPointerUp: stop,
    onPointerLeave: stop,
    onPointerCancel: stop,
    onContextMenu: (event: MouseEvent) => event.preventDefault(),
    onClick: (event: MouseEvent) => {
      if (!disabled && event.detail === 0) {
        latest.current(1);
      }
    },
  };
};
