import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { KeyboardEvent, PointerEvent, ReactNode } from "react";

import { usePrefersReducedMotion } from "../lib/clock.ts";
import { cx } from "../lib/cx.ts";
import {
  decimalsOf,
  formatCompact,
  formatLimit,
  formatNumber,
  formatReadableWithUnit,
  formatSpoken,
  parseEsNumber,
} from "../lib/format.ts";
import { createScale, roundTo } from "../lib/scale.ts";
import type { ScaleKind, Tick } from "../lib/scale.ts";
import { useHoldRepeat } from "../lib/use-hold-repeat.ts";
import { Badge } from "./badge.tsx";
import { Icon } from "./icon.tsx";

export interface EstimateRulerProps {
  /** Lowest selectable value (may be negative). */
  min: number;
  /** Highest selectable value. */
  max: number;
  /** Unit shown under the value and read by screen readers: "km", "personas", "°C". */
  unit: string;
  /** linear · log · auto (default: log when max / max(min, 1) > 10.000). */
  scale?: ScaleKind | "auto";
  /** Smallest change. Default 1. Decimal steps (0,5) are fine. */
  step?: number;
  /** The current estimate, or null when the player has not chosen yet. */
  value: number | null;
  /** Fires with the snapped value while dragging, on −/+, keys and exact entry. */
  onChange: (value: number) => void;
  /** The value the server has for this player. When it equals value the ruler shows "Enviado"; when it differs, "Sin enviar". */
  sentValue?: number | null;
  /** Sent and final (the "locked after Enviar" rule): read-only, with a lock. */
  locked?: boolean;
  /** The deadline passed: read-only, greyed, "Se acabó el tiempo". */
  disabled?: boolean;
  /** Accessible name of the slider. Default "Tu estimación". */
  label?: string;
}

const MINOR = 16;
const MID = 26;
const MAJOR = 38;
const TICK_WIDTH = { major: MAJOR, mid: MID, minor: MINOR } as const;
/** Inertia time constant in ms (iOS-like). */
const TAU = 325;
const clamp = (x: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, x));
const rubber = (over: number, dim: number) =>
  (over * dim * 0.55) / (dim + 0.55 * over);

/** Where the tape is drawn for position y: past either end it resists like a rubber band. */
const rubberBand = (y: number, height: number, length: number): number => {
  if (y < 0) {
    return -rubber(-y, height);
  }
  return y > length ? length + rubber(y - length, height) : y;
};

/** Slow = fine (0,35×), normal = 1×, fast flicks up to 4×: precision follows the hand. */
const dragGain = (speed: number): number => {
  if (speed < 0.08) {
    return 0.35;
  }
  return speed < 0.5 ? 1 : Math.min(4, 1 + (speed - 0.5) * 3);
};

/** The big number steps down by length inside a fixed-height box, so nothing below moves. */
const estimateSizeClass = (text: string): string => {
  if (text.length <= 7) {
    return "text-estimate";
  }
  return text.length <= 10 ? "text-estimate-md" : "text-estimate-sm";
};

const RulerStatus = ({
  value,
  sentValue,
  locked,
  disabled,
  decimals,
}: {
  value: number | null;
  sentValue: number | null | undefined;
  locked: boolean;
  disabled: boolean;
  decimals: number;
}): ReactNode => {
  if (disabled) {
    return <Badge icon="clock">Se acabó el tiempo</Badge>;
  }
  if (sentValue !== undefined && sentValue !== null) {
    if (sentValue === value) {
      return (
        <Badge
          tone="success"
          variant="solid"
          icon={locked ? "lock" : "check"}
          className="animate-stamp"
        >
          Enviado
        </Badge>
      );
    }
    return (
      <Badge tone="warning" icon="pencil">
        Sin enviar · antes {formatNumber(sentValue, decimals)}
      </Badge>
    );
  }
  if (value === null) {
    return (
      <span className="text-ink-muted text-sm">
        Arrastra la regla o toca el número
      </span>
    );
  }
  return null;
};

/**
 * The tape's marks or its labels. They are drawn as two layers, marks under the indicator and
 * labels over it, so the label under the indicator is never struck through: its tape-coloured
 * background masks the line.
 */
const TapeTicks = ({
  part,
  ticks,
  inert,
  logLabels,
  yOf,
}: {
  part: "marks" | "labels";
  ticks: Tick[];
  inert: boolean;
  logLabels: boolean;
  yOf: (t: number) => number;
}) =>
  ticks.map((tick) =>
    part === "labels" && tick.level === "minor" ? null : (
      <div
        key={tick.value}
        className="absolute left-0 flex items-center"
        style={{ top: yOf(tick.t), transform: "translateY(-50%)" }}
      >
        <span
          className={cx(
            "block",
            part === "labels" && "invisible",
            inert ? "bg-ink-muted" : "bg-on-primary",
            tick.level === "minor" ? "h-0.5" : "h-[3px]"
          )}
          style={{ width: TICK_WIDTH[tick.level] }}
        />
        {part === "marks" || tick.level === "minor" ? null : (
          <span
            className={cx(
              "condensed ml-1 rounded-sm px-1 py-0.5 leading-none whitespace-nowrap",
              tick.level === "major"
                ? "text-lg font-extrabold"
                : "text-sm font-bold",
              inert
                ? "bg-surface-sunken text-ink-muted"
                : "bg-primary text-on-primary"
            )}
          >
            {formatCompact(tick.value, logLabels)}
          </span>
        )}
      </div>
    )
  );

/** The big number. Tapping it turns it into a decimal field for exact entry. */
const ValueEntry = ({
  value,
  decimals,
  unit,
  inert,
  valuetext,
  onCommit,
}: {
  value: number | null;
  decimals: number;
  unit: string;
  inert: boolean;
  valuetext: string;
  onCommit: (draft: string) => void;
}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const text = value === null ? "¿?" : formatNumber(value, decimals);
  const commit = () => {
    setEditing(false);
    onCommit(draft);
  };
  return editing ? (
    <input
      autoFocus
      inputMode="decimal"
      enterKeyHint="done"
      aria-label={`Escribe tu estimación en ${unit}`}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          commit();
        }
        if (e.key === "Escape") {
          setEditing(false);
        }
      }}
      className="condensed border-line bg-surface-raised text-estimate-md text-ink outline-focus h-16 w-full rounded-md border-2 text-center font-extrabold outline-3 outline-offset-2"
    />
  ) : (
    <button
      type="button"
      disabled={inert}
      onClick={() => {
        setDraft(value === null ? "" : formatNumber(value, decimals));
        setEditing(true);
      }}
      aria-label={`${valuetext}. Toca para escribir el número`}
      className={cx(
        "condensed group flex h-16 max-w-full items-center gap-2 rounded-md px-2 leading-none font-extrabold whitespace-nowrap",
        estimateSizeClass(text),
        value === null ? "text-ink-muted" : "text-ink",
        !inert && "hover:bg-surface-sunken"
      )}
    >
      <span aria-hidden="true">{text}</span>
      {inert ? null : (
        <Icon name="pencil" size={18} className="text-ink-muted opacity-70" />
      )}
    </button>
  );
};

/** The fixed line the tape slides under. */
const Indicator = ({
  inert,
  dragging,
  empty,
}: {
  inert: boolean;
  dragging: boolean;
  empty: boolean;
}) => (
  <div
    aria-hidden="true"
    className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2"
  >
    {/* on the yellow tape the indicator is on-primary (dark in both themes); on the grey read-only tape it is ink */}
    <div
      className={cx(
        "relative mx-0 transition-[height] duration-(--duration-fast)",
        inert ? "bg-ink" : "bg-on-primary",
        dragging ? "h-[5px]" : "h-[3px]",
        empty && "opacity-60"
      )}
    />
    <span
      className={cx(
        "absolute top-1/2 left-0 size-0 -translate-y-1/2 border-y-[9px] border-l-[12px] border-y-transparent",
        inert ? "border-l-ink" : "border-l-on-primary"
      )}
    />
    <span
      className={cx(
        "absolute top-1/2 right-0 size-0 -translate-y-1/2 border-y-[9px] border-r-[12px] border-y-transparent",
        inert ? "border-r-ink" : "border-r-on-primary"
      )}
    />
  </div>
);

/**
 * The tape-measure picker. Drag it up and down under the fixed indicator; fine-tune with −/+
 * (hold to repeat); tap the big number to type it. Keyboard and screen readers use it as a slider.
 */
export const EstimateRuler = ({
  min,
  max,
  unit,
  scale: scaleKind = "auto",
  step = 1,
  value,
  onChange,
  sentValue,
  locked = false,
  disabled = false,
  label = "Tu estimación",
}: EstimateRulerProps) => {
  const scale = useMemo(
    () => createScale({ min, max, step, kind: scaleKind }),
    [min, max, step, scaleKind]
  );
  const L = scale.length;
  const decimals = decimalsOf(step);
  const inert = locked || disabled;
  const reduced = usePrefersReducedMotion();
  const ids = useId();

  // ---- geometry -------------------------------------------------------------------------------
  const track = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  const labelLayer = useRef<HTMLDivElement>(null);
  const [trackHeight, setTrackHeight] = useState(320);
  const H = trackHeight;
  useLayoutEffect(() => {
    const el = track.current;
    if (!el) {
      return;
    }
    const ro = new ResizeObserver(([entry]) => {
      if (entry) {
        setTrackHeight(Math.max(160, Math.round(entry.contentRect.height)));
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const yOf = useCallback((v: number) => scale.toT(v) * L, [scale, L]);
  // Tick window centre: React re-renders the ticks only when the tape travels half a screen.
  const [anchor, setAnchor] = useState(() =>
    value === null ? L / 2 : scale.toT(value) * L
  );
  // Ruler position under the indicator in px, 0 = min. Starts in the middle when empty.
  const pos = useRef(anchor);
  const anchorRef = useRef(anchor);
  const emitted = useRef<number | null>(value);
  const [dragging, setDragging] = useState(false);
  const anim = useRef<number | null>(null);

  const paint = useCallback(
    (y: number) => {
      const shown = rubberBand(y, H, L);
      const transform = `translate3d(0, ${shown - anchorRef.current}px, 0)`;
      if (layer.current) {
        layer.current.style.transform = transform;
      }
      if (labelLayer.current) {
        labelLayer.current.style.transform = transform;
      }
      if (Math.abs(shown - anchorRef.current) > H / 2) {
        anchorRef.current = shown;
        setAnchor(shown);
      }
    },
    [H, L]
  );
  useLayoutEffect(() => {
    // The ticks were just re-rendered around the new anchor: re-apply the transform.
    anchorRef.current = anchor;
    paint(pos.current);
  }, [anchor, paint]);

  const valueAt = useCallback(
    (y: number) => scale.snap(scale.fromT(clamp(y, 0, L) / L)),
    [scale, L]
  );

  const lastMajor = useRef<number | null>(null);
  const emit = useCallback(
    (v: number) => {
      if (v === emitted.current) {
        return;
      }
      emitted.current = v;
      onChange(v);
      // haptic tick when crossing a decade (log) or a tenth of the range (linear)
      const band =
        scale.kind === "log"
          ? Math.floor(Math.log10(Math.abs(v) + 1))
          : Math.floor(scale.toT(v) * 10);
      if (lastMajor.current !== null && band !== lastMajor.current) {
        navigator.vibrate?.(6);
      }
      lastMajor.current = band;
    },
    [onChange, scale]
  );

  const stop = useCallback(() => {
    if (anim.current !== null) {
      cancelAnimationFrame(anim.current);
    }
    anim.current = null;
  }, []);

  /** Exponential glide to target (px). Emits values while passing them when `live`. */
  const glide = useCallback(
    (target: number, tau: number, live: boolean) => {
      stop();
      const from = pos.current;
      if (reduced || tau <= 0 || Math.abs(target - from) < 0.5) {
        pos.current = target;
        paint(target);
        return;
      }
      const t0 = performance.now();
      const frame = (now: number) => {
        const y = target + (from - target) * Math.exp(-(now - t0) / tau);
        const done = Math.abs(y - target) < 0.4;
        pos.current = done ? target : y;
        paint(pos.current);
        if (live) {
          emit(valueAt(pos.current));
        }
        anim.current = done ? null : requestAnimationFrame(frame);
      };
      anim.current = requestAnimationFrame(frame);
    },
    [emit, paint, reduced, stop, valueAt]
  );

  // External value (poll, parent reset): move there unless the finger is on the ruler.
  useEffect(() => {
    if (dragging || value === null || value === emitted.current) {
      return;
    }
    emitted.current = value;
    glide(yOf(value), 90, false);
  }, [value, dragging, glide, yOf]);
  useEffect(() => stop, [stop]);

  // ---- pointer drag with velocity-dependent gain, inertia and rubber band ---------------------
  const drag = useRef({ y: 0, t: 0, vel: 0, gain: 1, moved: false });
  const onPointerDown = (e: PointerEvent) => {
    if (inert || e.button !== 0) {
      return;
    }
    stop();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = {
      y: e.clientY,
      t: e.timeStamp,
      vel: 0,
      gain: 1,
      moved: false,
    };
    setDragging(true);
  };
  const onPointerMove = (e: PointerEvent) => {
    if (!dragging) {
      return;
    }
    const d = drag.current;
    const dy = e.clientY - d.y;
    const dt = Math.max(1, e.timeStamp - d.t);
    d.vel = 0.7 * (dy / dt) + 0.3 * d.vel;
    const speed = Math.abs(d.vel);
    d.gain = dragGain(speed);
    const outside = pos.current < 0 || pos.current > L;
    pos.current += dy * (outside ? 0.4 : d.gain);
    d.y = e.clientY;
    d.t = e.timeStamp;
    if (Math.abs(dy) > 0) {
      d.moved = true;
    }
    paint(pos.current);
    emit(valueAt(pos.current));
  };
  const onPointerUp = () => {
    if (!dragging) {
      return;
    }
    setDragging(false);
    const d = drag.current;
    if (!d.moved) {
      if (emitted.current === null) {
        emit(valueAt(pos.current));
      }
      return;
    }
    // Release velocity in ruler px/ms.
    const v = d.vel * d.gain;
    const projected = Math.abs(v) > 0.15 ? pos.current + v * TAU : pos.current;
    const target = yOf(valueAt(projected));
    glide(target, Math.abs(v) > 0.15 ? TAU : 120, true);
  };

  // ---- discrete changes: keys, −/+, typing ---------------------------------------------------
  const current = () => emitted.current ?? valueAt(L / 2);
  const setValue = useCallback(
    (v: number, exact = false) => {
      const next = exact
        ? clamp(roundTo(v, step), min, max)
        : scale.snap(clamp(v, min, max));
      emit(next);
      glide(yOf(next), 110, false);
    },
    [emit, glide, max, min, scale, step, yOf]
  );
  const nudge = (dir: 1 | -1, mult = 1) => {
    const base = current();
    const s = scale.stepAt(base) * mult;
    let next = scale.snap(base + dir * s);
    if (next === base) {
      next = clamp(roundTo(base + dir * s, step), min, max);
    }
    setValue(next, true);
  };
  const plus = useHoldRepeat((m) => nudge(1, m), inert);
  const minus = useHoldRepeat((m) => nudge(-1, m), inert);

  const onKeyDown = (e: KeyboardEvent) => {
    if (inert) {
      return;
    }
    const v = current();
    const map: Record<string, () => void> = {
      ArrowUp: () => nudge(1),
      ArrowRight: () => nudge(1),
      ArrowDown: () => nudge(-1),
      ArrowLeft: () => nudge(-1),
      PageUp: () => setValue(scale.majorFrom(v, 1), true),
      PageDown: () => setValue(scale.majorFrom(v, -1), true),
      Home: () => setValue(min, true),
      End: () => setValue(max, true),
    };
    const action = map[e.key];
    if (action) {
      e.preventDefault();
      action();
    }
  };

  // exact entry
  const [note, setNote] = useState<string | null>(null);
  useEffect(() => {
    if (!note) {
      return;
    }
    const t = window.setTimeout(() => setNote(null), 4000);
    return () => window.clearTimeout(t);
  }, [note]);
  const commit = (draft: string) => {
    if (!draft.trim()) {
      return;
    }
    const n = parseEsNumber(draft);
    if (n === null) {
      return setNote("Escribe solo números, como 1.250 o 3,5.");
    }
    if (n < min) {
      setNote(
        `Como mínimo ${formatLimit(min, unit, decimals)}. Lo hemos dejado ahí.`
      );
    } else if (n > max) {
      setNote(
        `Como máximo ${formatLimit(max, unit, decimals)}. Lo hemos dejado ahí.`
      );
    }
    setValue(n, true);
  };

  // ---- render ---------------------------------------------------------------------------------
  const tWin0 = (anchor - H) / L;
  const tWin1 = (anchor + H) / L;
  const ticks = scale.ticks(tWin0, tWin1, L);
  const layerY = (y: number) => H / 2 - (y - anchor);

  const readable = value === null ? null : formatReadableWithUnit(value, unit);
  const status = (
    <RulerStatus
      value={value}
      sentValue={sentValue}
      locked={locked}
      disabled={disabled}
      decimals={decimals}
    />
  );

  const valuetext =
    value === null ? "Sin estimación" : formatSpoken(value, unit, decimals);

  return (
    <div
      className={cx(
        "flex min-h-0 flex-1 flex-col gap-3",
        disabled && "opacity-80"
      )}
    >
      {/* readout: fixed heights so nothing shifts while the value changes */}
      <div className="flex flex-col items-center">
        <div className="flex h-16 w-full items-center justify-center">
          <ValueEntry
            value={value}
            decimals={decimals}
            unit={unit}
            inert={inert}
            valuetext={valuetext}
            onCommit={commit}
          />
        </div>
        <p
          className="text-ink-muted m-0 line-clamp-2 min-h-[52px] max-w-full px-2 text-center text-lg break-words"
          aria-hidden="true"
        >
          {readable ? <>≈ {readable}</> : unit}
        </p>
        <div className="flex h-7 items-center justify-center">
          {/* the exact-entry note takes the status row for 4 s */}
          <p
            role="status"
            aria-live="polite"
            className="text-info-text m-0 text-center text-sm font-bold"
          >
            {note}
          </p>
          {note ? null : status}
        </div>
      </div>

      {/* the tape */}
      <div className="relative flex min-h-60 flex-1 flex-col">
        <div
          ref={track}
          role="slider"
          tabIndex={inert ? -1 : 0}
          aria-label={label}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value ?? undefined}
          aria-valuetext={valuetext}
          aria-readonly={inert || undefined}
          aria-disabled={disabled || undefined}
          aria-describedby={`${ids}-help`}
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className={cx(
            "relative flex-1 touch-none overflow-hidden rounded-lg border-2 select-none",
            inert
              ? "border-line-subtle bg-surface-sunken"
              : "cursor-grab border-line bg-primary shadow-sticker active:cursor-grabbing"
          )}
        >
          <span id={`${ids}-help`} className="sr-only">
            Flechas para ajustar de uno en uno, Re Pág y Av Pág para saltar,
            Inicio y Fin para los límites.
          </span>
          <div
            aria-hidden="true"
            className="absolute inset-0 [mask-image:linear-gradient(to_bottom,transparent,black_18%,black_82%,transparent)]"
          >
            <div
              ref={layer}
              className="absolute inset-x-0 top-0 will-change-transform"
            >
              {/* beyond max and below min: hatched, so the end of the tape is obvious */}
              <div
                className="absolute inset-x-0 bg-[repeating-linear-gradient(135deg,var(--color-surface-sunken)_0_8px,var(--color-surface)_8px_16px)]"
                style={{ top: layerY(L) - 2 * H, height: 2 * H }}
              />
              <div
                className="absolute inset-x-0 bg-[repeating-linear-gradient(135deg,var(--color-surface-sunken)_0_8px,var(--color-surface)_8px_16px)]"
                style={{ top: layerY(0), height: 2 * H }}
              />
              <TapeTicks
                part="marks"
                ticks={ticks}
                inert={inert}
                logLabels={scale.kind === "log"}
                yOf={(t) => layerY(t * L)}
              />
            </div>
            <Indicator
              inert={inert}
              dragging={dragging}
              empty={value === null}
            />
            <div
              ref={labelLayer}
              className="absolute inset-x-0 top-0 will-change-transform"
            >
              <TapeTicks
                part="labels"
                ticks={ticks}
                inert={inert}
                logLabels={scale.kind === "log"}
                yOf={(t) => layerY(t * L)}
              />
            </div>
          </div>
        </div>

        {/* fine adjustment, in the thumb's reach on the right edge (outside the slider: a slider has no interactive children) */}
        {locked ? null : (
          <div className="absolute top-1/2 right-5 flex -translate-y-1/2 flex-col gap-10">
            {(
              [
                ["plus", plus, "Subir"],
                ["minus", minus, "Bajar"],
              ] as const
            ).map(([icon, handlers, name]) => (
              <button
                key={icon}
                type="button"
                tabIndex={-1}
                disabled={disabled}
                aria-label={`${name} un paso`}
                {...handlers}
                className="pressable border-line bg-surface-raised text-ink shadow-sticker-sm disabled:border-line-subtle disabled:text-ink-muted inline-flex size-12 items-center justify-center rounded-full border-2 [--press-depth:2px] disabled:shadow-none"
              >
                <Icon name={icon} size={24} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
