/**
 * Value ↔ position engine shared by EstimateRuler and RevealRuler.
 *
 * Everything maps through a normalised coordinate t ∈ [0, 1] (0 = min, 1 = max):
 *
 *   linear:  t(v) = (v − min) / (max − min)                v(t) = min + t · (max − min)
 *   log:     o    = min ≥ 1 ? 0 : 1 − min                  (offset so that v + o ≥ 1)
 *            a    = log10(min + o),  b = log10(max + o)
 *            t(v) = (log10(v + o) − a) / (b − a)           v(t) = 10^(a + t · (b − a)) − o
 *
 * A component turns t into pixels with a constant pxPerT (the ruler length L):  y = t · L.
 */

export type ScaleKind = "linear" | "log";

export interface Tick {
  value: number;
  t: number;
  /** 'major' ticks are long and labelled, 'mid' are labelled smaller, 'minor' are short and silent. */
  level: "major" | "mid" | "minor";
}

/**
 * Auto rule when the question does not say:  log  when  max / max(min, 1) > 10.000  (more than
 * four orders of magnitude), else linear. The brief's "> 1.000" would turn 0–8.848 m into a log
 * ruler, where 8.000 and 8.800 sit 9 px apart; at 10.000 that range stays linear and precise, while
 * 1–1.000.000.000 personas goes log.
 *   0–100 % → linear · 0–8.848 m → linear · 1–1.000.000.000 → log · −90–60 °C → linear
 */
export const chooseScale = (min: number, max: number): ScaleKind => {
  if (max <= 0) {
    return "linear";
  }
  const ratio = max / Math.max(min, 1);
  return ratio > 10_000 ? "log" : "linear";
};

/** Rounds to the precision of `step` and removes floating noise (0.1 + 0.2 → 0.3). */
export const roundTo = (v: number, step: number): number => {
  const d = Math.min(10, Math.max(0, -Math.floor(Math.log10(step)) + 1));
  return Number((Math.round(v / step) * step).toFixed(d));
};

/** Smallest "nice" number (1, 2, 5 × 10ⁿ) that is ≥ x. */
export const niceCeil = (x: number): number => {
  if (x <= 0) {
    return 1;
  }
  const e = Math.floor(Math.log10(x));
  const base = 10 ** e;
  for (const m of [1, 2, 5, 10]) {
    if (m * base >= x * (1 - 1e-9)) {
      return m * base;
    }
  }
  return 10 * base;
};

export interface Scale {
  kind: ScaleKind;
  min: number;
  max: number;
  step: number;
  toT: (v: number) => number;
  fromT: (t: number) => number;
  /** Snaps to what the player can select. Linear: multiples of step from min. Log: 2 significant digits (but never finer than step). */
  snap: (v: number) => number;
  /** The step that +/− buttons and arrow keys move by at value v. */
  stepAt: (v: number) => number;
  /** Next value one major tick up (dir = 1) or down (dir = −1). Page Up / Page Down. */
  majorFrom: (v: number, dir: 1 | -1) => number;
  /** Ticks between t0 and t1 for a ruler drawn at pxPerT pixels per unit of t. */
  ticks: (t0: number, t1: number, pxPerT: number) => Tick[];
  /** Comfortable full length in px for a draggable ruler (EstimateRuler uses this as L). */
  length: number;
}

const MIN_TICK_PX = 10;
const DECADE_PX = 240;
const MINOR_PX = 12;
const clamp = (x: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, x));

/** Majors land on 1, 2 or 5 × 10ⁿ: every 5 minors when the minor starts with a 2, else every 10. */
const majorOf = (minor: number) =>
  String(minor).startsWith("2") ? minor * 5 : minor * 10;

const linearLevel = (isMajor: boolean, isMid: boolean): Tick["level"] => {
  if (isMajor) {
    return "major";
  }
  return isMid ? "mid" : "minor";
};

/** Label every decade when there is room, else every second or third one. */
const decadeLabelEvery = (pxPerDecade: number): number => {
  if (pxPerDecade >= 40) {
    return 1;
  }
  return pxPerDecade >= 20 ? 2 : 3;
};

export const createScale = (opts: {
  min: number;
  max: number;
  step?: number;
  kind?: ScaleKind | "auto";
}): Scale => {
  const { min, max } = opts;
  const step = opts.step && opts.step > 0 ? opts.step : 1;
  const kind: ScaleKind =
    !opts.kind || opts.kind === "auto" ? chooseScale(min, max) : opts.kind;
  const range = max - min;

  if (kind === "linear") {
    const minorStep = Math.max(niceCeil(step), niceCeil(range / 200));
    const minorCount = range / minorStep;
    const length = Math.max(600, minorCount * MINOR_PX);
    const toT = (v: number) => (v - min) / range;
    const fromT = (t: number) => min + t * range;
    const snap = (v: number) =>
      clamp(roundTo(min + roundTo(v - min, step), step), min, max);
    return {
      kind,
      min,
      max,
      step,
      toT,
      fromT,
      snap,
      length,
      stepAt: () => step,
      majorFrom(v, dir) {
        const M = majorOf(minorStep);
        const k =
          dir > 0 ? Math.floor(v / M + 1e-9) + 1 : Math.ceil(v / M - 1e-9) - 1;
        return clamp(roundTo(k * M, step), min, max);
      },
      ticks(t0, t1, pxPerT) {
        const pxPerUnit = pxPerT / range;
        const m = Math.max(minorStep, niceCeil(MIN_TICK_PX / pxPerUnit));
        const M = majorOf(m);
        const mid = String(m).startsWith("2") ? null : M / 2;
        const v0 = fromT(Math.max(0, t0));
        const v1 = fromT(Math.min(1, t1));
        const out: Tick[] = [];
        for (let k = Math.ceil(v0 / m - 1e-9); k * m <= v1 + 1e-9; k += 1) {
          const v = roundTo(k * m, m);
          const isMajor = Math.abs(v / M - Math.round(v / M)) < 1e-6;
          const isMid =
            !isMajor &&
            mid !== null &&
            Math.abs(v / mid - Math.round(v / mid)) < 1e-6;
          out.push({
            value: v,
            t: toT(v),
            level: linearLevel(isMajor, isMid),
          });
        }
        return out;
      },
    };
  }

  // log
  const o = min >= 1 ? 0 : 1 - min;
  const a = Math.log10(min + o);
  const b = Math.log10(max + o);
  const toT = (v: number) => (Math.log10(Math.max(v + o, 1e-12)) - a) / (b - a);
  const fromT = (t: number) => 10 ** (a + t * (b - a)) - o;
  const stepAt = (v: number) => {
    const mag = Math.abs(v) < 1 ? 0 : Math.floor(Math.log10(Math.abs(v)));
    return Math.max(step, 10 ** (mag - 1));
  };
  const snap = (v: number) => {
    const s = stepAt(v);
    return clamp(roundTo(v, s), min, max);
  };
  const NICE = [1, 2, 5];
  const niceAround = (v: number, dir: 1 | -1) => {
    // next 1-2-5 value strictly above (dir 1) or below (dir −1) v, symmetric for negatives
    if (v === 0) {
      return dir > 0 ? 1 : -1;
    }
    const sign = Math.sign(v);
    const a2 = Math.abs(v);
    const e = Math.floor(Math.log10(a2));
    const cands: number[] = [];
    for (let k = e - 1; k <= e + 1; k += 1) {
      for (const m of NICE) {
        cands.push(m * 10 ** k);
      }
    }
    const signed = [...cands.map((c) => c * sign), 0].toSorted((x, y) => x - y);
    return dir > 0
      ? (signed.find((c) => c > v + 1e-9) ?? max)
      : (signed.findLast((c) => c < v - 1e-9) ?? min);
  };
  return {
    kind,
    min,
    max,
    step,
    toT,
    fromT,
    snap,
    stepAt,
    length: Math.max(600, (b - a) * DECADE_PX),
    majorFrom: (v, dir) => clamp(niceAround(v, dir), min, max),
    ticks(t0, t1, pxPerT) {
      const pxPerDecade = pxPerT / (b - a);
      const v0 = fromT(Math.max(0, t0));
      const v1 = fromT(Math.min(1, t1));
      const out: Tick[] = [];
      const push = (v: number, level: Tick["level"]) => {
        if (v >= v0 - 1e-9 && v <= v1 + 1e-9 && v >= min && v <= max) {
          out.push({ value: v, t: toT(v), level });
        }
      };
      // Every decade ≥ 1 in absolute value, for both signs that fall inside [min, max].
      const maxExp = Math.ceil(
        Math.log10(Math.max(Math.abs(min), Math.abs(max), 1))
      );
      const labelEvery = decadeLabelEvery(pxPerDecade);
      for (const sign of [1, -1]) {
        for (let e = 0; e <= maxExp; e += 1) {
          const base = 10 ** e;
          push(sign * base, e % labelEvery === 0 ? "major" : "minor");
          if (pxPerDecade >= 60) {
            push(sign * 2 * base, "mid");
            push(sign * 5 * base, "mid");
          }
          if (pxPerDecade >= 160) {
            for (const m of [3, 4, 6, 7, 8, 9]) {
              push(sign * m * base, "minor");
            }
          }
        }
      }
      if (min <= 0 && max >= 0) {
        push(0, "major");
      }
      return out.toSorted((x, y) => x.t - y.t);
    },
  };
};
