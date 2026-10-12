import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

/** Accepts epoch milliseconds or an ISO string from the server. */
export type ServerTime = number | string;
export const toMs = (t: ServerTime): number =>
  typeof t === "number" ? t : Date.parse(t);

/**
 * Keeps the offset between the server clock and this phone's clock.
 * Polls arrive every second with a fresh serverNow; we only adopt a new offset when it drifts more
 * than 250 ms, so the countdown never jumps back and forth between polls.
 * Returns a stable function that gives "now" in server time. Call it from effects and animation
 * frames, not during render: on the very first render, use `serverNow` itself as "now".
 */
export const useServerNow = (serverNow: ServerTime): (() => number) => {
  const offset = useRef<number | null>(null);
  const server = toMs(serverNow);
  useLayoutEffect(() => {
    if (!Number.isFinite(server)) {
      return;
    }
    const next = server - Date.now();
    if (offset.current === null || Math.abs(next - offset.current) > 250) {
      offset.current = next;
    }
  }, [server]);
  return useCallback(() => Date.now() + (offset.current ?? 0), []);
};

/** Calls `fn` every animation frame while `active`. Stops on unmount. */
export const useAnimationFrame = (
  fn: (now: number) => void,
  active = true
): void => {
  const ref = useRef(fn);
  useLayoutEffect(() => {
    ref.current = fn;
  });
  useEffect(() => {
    if (!active) {
      return;
    }
    let id = 0;
    const loop = (now: number) => {
      ref.current(now);
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [active]);
};

export const usePrefersReducedMotion = (): boolean => {
  const query = "(prefers-reduced-motion: reduce)";
  const [reduced, setReduced] = useState(
    () => typeof window !== "undefined" && !!window.matchMedia?.(query).matches
  );
  useEffect(() => {
    const mq = window.matchMedia?.(query);
    if (!mq) {
      return;
    }
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
};
