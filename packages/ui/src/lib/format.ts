/**
 * Spanish (Spain) number formatting, deterministic on every browser.
 *
 * Why not plain Intl.NumberFormat('es-ES')? CLDR leaves 4-digit numbers ungrouped in Spanish
 * ("1234" but "12.345"). In a game where numbers sit next to each other and change while you
 * look at them, that inconsistency reads as a bug, so we always group thousands: 1.234.
 */

/** Typographic minus, the same width as a digit in tabular figures. */
const MINUS = "−";
const NBSP = " ";

/** Decimal places needed to show `step` exactly (0.25 → 2, 1 → 0). */
export const decimalsOf = (step: number): number => {
  if (!Number.isFinite(step) || Number.isInteger(step)) {
    return 0;
  }
  const s = String(step);
  if (s.includes("e-")) {
    return Number(s.split("e-")[1]);
  }
  return (s.split(".")[1] ?? "").length;
};

/** 1234567.5 → "1.234.567,5". Trailing zeros are dropped unless `fixed` is true. */
export const formatNumber = (
  value: number,
  maxDecimals = 2,
  fixed = false
): string => {
  if (!Number.isFinite(value)) {
    return "—";
  }
  const neg = value < 0;
  const s = Math.abs(value).toFixed(maxDecimals);
  const [whole = "", fraction = ""] = s.split(".");
  const dec = fixed ? fraction : fraction.replace(/0+$/u, "");
  const int = whole.replaceAll(/\B(?=(?:\d{3})+(?!\d))/gu, ".");
  const body = dec ? `${int},${dec}` : int;
  return neg && Number(s) !== 0 ? MINUS + body : body;
};

/** Number plus unit with a non-breaking space: "45 %", "−12 °C", "12 €", "8.848 m". */
export const formatWithUnit = (
  value: number,
  unit: string,
  maxDecimals = 2
): string =>
  unit
    ? `${formatNumber(value, maxDecimals)}${NBSP}${unit}`
    : formatNumber(value, maxDecimals);

/**
 * A range limit inside a sentence: "Como mínimo 5 personas". Units come in the plural, so for
 * ±1 the unit is left out ("Como mínimo 1", never "1 personas"); it is on screen next to the value.
 */
export const formatLimit = (
  value: number,
  unit: string,
  maxDecimals = 2
): string =>
  Math.abs(value) === 1
    ? formatNumber(value, maxDecimals)
    : formatWithUnit(value, unit, maxDecimals);

const BIG = [
  { v: 1e12, one: "billón", many: "billones" },
  { v: 1e9, one: "mil millones", many: "mil millones" },
  { v: 1e6, one: "millón", many: "millones" },
] as const;

/**
 * Readable form for big numbers, or null when the full form is already readable (|v| < 1 M).
 * 1_200_000 → "1,2 millones" · 1_000_000 → "1 millón" · 3_400_000_000 → "3,4 mil millones"
 */
export const formatReadable = (value: number): string | null => {
  const a = Math.abs(value);
  for (const b of BIG) {
    if (a >= b.v) {
      const n = Math.round((a / b.v) * 10) / 10;
      const word = n === 1 ? b.one : b.many;
      return `${value < 0 ? MINUS : ""}${formatNumber(n, 1)} ${word}`;
    }
  }
  return null;
};

/** "1,2 millones de personas" · "1 millón de km" — the readable form joined to its unit. */
export const formatReadableWithUnit = (
  value: number,
  unit: string
): string | null => {
  const r = formatReadable(value);
  if (!r) {
    return null;
  }
  return unit ? `${r} de ${unit}` : r;
};

/**
 * Compact tick labels: 950 · 4.500 · 25 k · 1 M · 1.000 M · 1 B (billón).
 * `thousandsAsK` (used by log rulers) also writes 1.000 as "1 k".
 */
export const formatCompact = (value: number, thousandsAsK = false): string => {
  const a = Math.abs(value);
  const sign = value < 0 ? MINUS : "";
  if (a >= 1e12) {
    return `${sign}${formatNumber(a / 1e12, 1)}${NBSP}B`;
  }
  if (a >= 1e6) {
    return `${sign}${formatNumber(a / 1e6, 1)}${NBSP}M`;
  }
  if (a >= 1e4 || (thousandsAsK && a >= 1e3)) {
    return `${sign}${formatNumber(a / 1e3, 1)}${NBSP}k`;
  }
  return formatNumber(value, 2);
};

/** Text for screen readers: plain hyphen-minus (read as "menos"), readable form when big. */
export const formatSpoken = (
  value: number,
  unit: string,
  maxDecimals = 2
): string => {
  const readable = formatReadableWithUnit(value, unit);
  const text = readable ?? formatWithUnit(value, unit, maxDecimals);
  return text.replaceAll(MINUS, "-").replaceAll(NBSP, " ");
};

/** Signed distance to the solution: "+120 m", "−3 %", "0 m". */
export const formatSigned = (
  value: number,
  unit: string,
  maxDecimals = 2
): string => {
  const body = formatWithUnit(Math.abs(value), unit, maxDecimals);
  if (value === 0) {
    return body;
  }
  return (value > 0 ? "+" : MINUS) + body;
};

/**
 * Parses what a Spanish player types into the exact-entry field.
 * "1.234.567,5" → 1234567.5 · "1,5" → 1.5 · "1.500" → 1500 · "1.5" → 1.5 · "-12" → -12
 * Returns null when it is not a number.
 */
export const parseEsNumber = (input: string): number | null => {
  let s = input
    .trim()
    .replaceAll(/\s/gu, "")
    .replaceAll(/[−–]/gu, "-");
  if (!s) {
    return null;
  }
  const hasDot = s.includes(".");
  const hasComma = s.includes(",");
  if (hasDot && hasComma) {
    s = s.replaceAll(".", "").replace(",", ".");
  } else if (hasComma) {
    s = s.replace(",", ".");
  } else if (hasDot && /^-?\d{1,3}(?:\.\d{3})+$/u.test(s)) {
    s = s.replaceAll(".", "");
  }
  if (!/^-?(?:\d+\.?\d*|\.\d+)$/u.test(s)) {
    return null;
  }
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};

/** Points in Spanish: "1 punto", "3 puntos". */
export const formatPoints = (n: number): string =>
  `${formatNumber(n, 0)} ${Math.abs(n) === 1 ? "punto" : "puntos"}`;
