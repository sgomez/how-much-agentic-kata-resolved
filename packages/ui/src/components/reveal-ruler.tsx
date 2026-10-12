import { useLayoutEffect, useMemo, useRef, useState } from "react";

import { cx } from "../lib/cx.ts";
import {
  formatCompact,
  formatSpoken,
  formatWithUnit,
  decimalsOf,
} from "../lib/format.ts";
import { createScale } from "../lib/scale.ts";
import type { ScaleKind } from "../lib/scale.ts";
import { Avatar } from "./avatar.tsx";
import { Icon } from "./icon.tsx";

export interface RevealEstimate {
  player: { id: string; name: string };
  /** null = did not answer in time ("Sin respuesta"). */
  value: number | null;
  /** Shown but not competing (the impostor, when your rules say so): dashed, never "closest". To hide it, leave it out. */
  excluded?: boolean;
}

export interface RevealRulerProps {
  min: number;
  max: number;
  unit: string;
  scale?: ScaleKind | "auto";
  step?: number;
  /** The right answer. */
  solution: number;
  estimates: RevealEstimate[];
  /** Height of the chart in px. Default 340. */
  height?: number;
}

/** Width of the ruler strip in px. */
const TAPE = 88;
/** Avatar size in px. */
const DOT = 28;
/** Column pitch for overlapping avatars in px. */
const GAP = 30;
/** How far the "closest" ring (3px ring + 2px offset) reaches past the avatar, in px. */
const RING = 5;
/** Clear space kept between two markers, in px. */
const CLEAR = 2;
/** Minimum width of the "+N" chip in px (min-w-8). */
const CHIP = 32;
const TICK_CLASS = {
  minor: "h-0.5 w-3",
  mid: "h-0.5 w-5",
  major: "h-[3px] w-7",
} as const;

/** Closest estimate(s) among competing answers (ties all win). */
export const closestIds = (
  estimates: RevealEstimate[],
  solution: number
): Set<string> => {
  const valid = estimates.filter((e) => e.value !== null && !e.excluded);
  if (!valid.length) {
    return new Set();
  }
  const best = Math.min(
    ...valid.map((e) => Math.abs((e.value as number) - solution))
  );
  return new Set(
    valid
      .filter((e) => Math.abs((e.value as number) - solution) === best)
      .map((e) => e.player.id)
  );
};

/**
 * Read-only reveal: the ruler zoomed to where the answers fell, the solution as a pink line,
 * every estimate as the player's avatar at its exact height (leader line to the tape), the
 * closest ringed. Avatars that would overlap step sideways (a 1-D beeswarm); if the lane is
 * full, the rest collapse into "+N". The text equivalent is RevealList.
 */
export const RevealRuler = ({
  min,
  max,
  unit,
  scale: kind = "auto",
  step = 1,
  solution,
  estimates,
  height = 340,
}: RevealRulerProps) => {
  const scale = useMemo(
    () => createScale({ min, max, step, kind }),
    [min, max, step, kind]
  );
  const box = useRef<HTMLDivElement>(null);
  const [boxWidth, setBoxWidth] = useState(328);
  const W = boxWidth;
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) {
      return;
    }
    const ro = new ResizeObserver(([entry]) => {
      if (entry) {
        setBoxWidth(Math.round(entry.contentRect.width));
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const answered = estimates.filter((e) => e.value !== null);
  const missing = estimates.filter((e) => e.value === null);
  const closest = closestIds(estimates, solution);

  // zoomed domain in t-space around solution and answers
  const ts = [solution, ...answered.map((e) => e.value as number)].map(
    scale.toT
  );
  let t0 = Math.min(...ts);
  let t1 = Math.max(...ts);
  const pad = Math.max(0.02, (t1 - t0) * 0.12);
  t0 -= pad;
  t1 += pad;
  if (t1 - t0 < 0.06) {
    const c = (t0 + t1) / 2;
    t0 = c - 0.03;
    t1 = c + 0.03;
  }
  t0 = Math.max(0, t0);
  t1 = Math.min(1, t1);
  // Keep half an avatar of room at both ends.
  const inner = height - DOT;
  const pxPerT = inner / (t1 - t0);
  const y = (v: number) => DOT / 2 + (t1 - scale.toT(v)) * pxPerT;
  const ticks = scale.ticks(t0, t1, pxPerT);

  // beeswarm placement: each marker takes the first lane where it collides with no other marker
  // (the closest ones are bigger: their ring counts); if no lane fits, it joins a "+N" chip
  const laneX = TAPE + 14;
  const sorted = answered.toSorted(
    (a, b) =>
      Number(closest.has(b.player.id)) - Number(closest.has(a.player.id)) ||
      (a.value as number) - (b.value as number)
  );
  const radius = (e: RevealEstimate) =>
    DOT / 2 + (closest.has(e.player.id) ? RING : 0);
  const layout = (lanes: number) => {
    const placed: { e: RevealEstimate; x: number; y: number; r: number }[] = [];
    const overflow: { y: number; count: number; names: string[] }[] = [];
    for (const e of sorted) {
      const yy = y(e.value as number);
      const r = radius(e);
      const lane = Array.from({ length: lanes }, (_, c) => c).find((c) => {
        const centre = laneX + c * GAP + DOT / 2;
        return placed.every(
          (p) =>
            (p.x + DOT / 2 - centre) ** 2 + (p.y - yy) ** 2 >=
            (p.r + r + CLEAR) ** 2
        );
      });
      if (lane === undefined) {
        const o = overflow.find((c) => Math.abs(c.y - yy) < DOT + CLEAR);
        if (o) {
          o.count += 1;
          o.names.push(e.player.name);
        } else {
          overflow.push({ y: yy, count: 1, names: [e.player.name] });
        }
        continue;
      }
      placed.push({ e, x: laneX + lane * GAP, y: yy, r });
    }
    return { placed, overflow };
  };
  const cols = Math.max(1, Math.floor((W - laneX - 4) / GAP));
  let { placed, overflow } = layout(cols);
  // Overflow: give up lanes on the right so the chips get their own column, clear of every ring.
  const chipLanes = Math.max(
    1,
    Math.floor((W - laneX - 4 - CHIP - RING) / GAP)
  );
  if (overflow.length > 0 && chipLanes < cols) {
    ({ placed, overflow } = layout(chipLanes));
  }
  const chipX = laneX + Math.min(cols, chipLanes) * GAP + RING;

  const decimals = decimalsOf(step);
  const sy = y(solution);
  const closestNames = answered
    .filter((e) => closest.has(e.player.id))
    .map((e) => e.player.name);
  const summary = `Solución: ${formatSpoken(solution, unit, decimals)}. ${closestNames.length ? `Más cerca: ${closestNames.join(" y ")}.` : ""}`;

  return (
    <figure className="m-0 flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-accent-text inline-flex items-center gap-1.5 text-sm font-bold">
          <Icon name="flag" size={16} />
          Solución
        </span>
        <span className="condensed animate-pop text-title text-ink font-extrabold">
          {formatWithUnit(solution, unit, decimals)}
        </span>
      </div>
      <div
        ref={box}
        role="img"
        aria-label={summary}
        className="border-line bg-surface-raised relative overflow-hidden rounded-lg border-2"
        style={{ height }}
      >
        {/* tape */}
        <div
          className="border-line bg-primary absolute inset-y-0 left-0 border-r-2"
          style={{ width: TAPE }}
          aria-hidden="true"
        >
          {ticks.map((t) => (
            <div
              key={t.value}
              className="absolute left-0 flex items-center"
              style={{ top: y(t.value), transform: "translateY(-50%)" }}
            >
              <span
                className={cx("block bg-on-primary", TICK_CLASS[t.level])}
              />
              {t.level === "minor" ? null : (
                <span
                  className={cx(
                    "condensed ml-1.5 leading-none whitespace-nowrap text-on-primary",
                    t.level === "major"
                      ? "text-sm font-extrabold"
                      : "text-xs font-bold"
                  )}
                >
                  {formatCompact(t.value, scale.kind === "log")}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* leader lines */}
        <svg
          className="pointer-events-none absolute inset-0"
          width="100%"
          height={height}
          aria-hidden="true"
        >
          {placed.map(({ e, x, y: yy }) => (
            <line
              key={e.player.id}
              x1={TAPE}
              x2={x}
              y1={yy}
              y2={yy}
              strokeWidth={2}
              className={e.excluded ? "stroke-line-subtle" : "stroke-line"}
              strokeDasharray={e.excluded ? "3 3" : undefined}
            />
          ))}
        </svg>

        {/* solution */}
        <div
          className="pointer-events-none absolute inset-x-0"
          style={{ top: sy }}
          aria-hidden="true"
        >
          <div className="animate-draw bg-accent h-[3px] origin-left -translate-y-1/2" />
          <span className="border-line bg-accent text-on-accent absolute top-1/2 left-1 inline-flex size-5 -translate-y-1/2 items-center justify-center rounded-full border-2">
            <Icon name="flag" size={11} />
          </span>
        </div>

        {/* markers */}
        {placed.map(({ e, x, y: yy }, i) => {
          const win = closest.has(e.player.id);
          return (
            <div
              key={e.player.id}
              className="animate-drop absolute"
              style={{
                left: x,
                top: yy - DOT / 2,
                animationDelay: `${150 + i * 40}ms`,
              }}
              title={`${e.player.name}: ${formatWithUnit(e.value as number, unit, decimals)}`}
              aria-hidden="true"
            >
              <span
                className={cx(
                  "relative block rounded-full",
                  win &&
                    "ring-3 ring-ink ring-offset-2 ring-offset-surface-raised",
                  e.excluded && "opacity-60"
                )}
              >
                <Avatar player={e.player} size="sm" />
                {win ? (
                  <span className="border-line bg-primary text-on-primary absolute -top-2 -right-2 inline-flex size-4 items-center justify-center rounded-full border-2">
                    <Icon name="target" size={9} />
                  </span>
                ) : null}
                {e.excluded ? (
                  <span className="border-line bg-surface-raised text-ink absolute -top-2 -right-2 inline-flex size-4 items-center justify-center rounded-full border-2">
                    <Icon name="mask" size={9} />
                  </span>
                ) : null}
              </span>
            </div>
          );
        })}
        {overflow.map((o) => (
          <span
            key={o.y}
            aria-hidden="true"
            title={o.names.join(", ")}
            className="condensed border-line bg-surface-raised text-ink absolute inline-flex h-7 min-w-8 items-center justify-center rounded-full border-2 px-1.5 text-sm font-extrabold"
            style={{ left: chipX, top: o.y - DOT / 2 }}
          >
            +{o.count}
          </span>
        ))}
      </div>
      <figcaption className="text-ink-muted flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        <span className="inline-flex items-center gap-1.5">
          <span className="bg-accent inline-block h-[3px] w-4" />
          Solución
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Icon name="target" size={14} />
          Más cerca
        </span>
        {missing.length ? (
          <span>
            Sin respuesta: {missing.map((m) => m.player.name).join(", ")}
          </span>
        ) : null}
      </figcaption>
    </figure>
  );
};
