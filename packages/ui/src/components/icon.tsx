import { cx } from "../lib/cx.ts";

/** Shapes: "M…" path · "c:cx,cy,r" circle · "r:x,y,w,h,rx" rect. 24×24 grid, 2px round strokes. */
const ICONS = {
  check: ["M5 12.5l4.5 4.5L19 7.5"],
  close: ["M6 6l12 12", "M18 6L6 18"],
  plus: ["M12 5v14", "M5 12h14"],
  minus: ["M5 12h14"],
  copy: [
    "r:8,8,12,12,2",
    "M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2",
  ],
  share: [
    "M12 3v12",
    "M7 8l5-5 5 5",
    "M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6",
  ],
  crown: ["M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z"],
  user: ["c:12,8,4", "M4 21c0-4 3.6-7 8-7s8 3 8 7"],
  users: [
    "c:9,8,3.5",
    "M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6",
    "M16 4.6a3.5 3.5 0 0 1 0 6.8",
    "M18 14.3c2.1.7 3.5 2.8 3.5 5.7",
  ],
  clock: ["c:12,12,9", "M12 7v5l3 2"],
  "wifi-off": [
    "M3 3l18 18",
    "M8.5 16.5a5 5 0 0 1 7 0",
    "M5 12.9a10 10 0 0 1 5-2.7",
    "M19 12.9a10 10 0 0 0-2.4-1.7",
    "M2 8.8a15 15 0 0 1 4.3-2.6",
    "M22 8.8A15 15 0 0 0 10.8 5",
    "M12 20h.01",
  ],
  refresh: ["M20 11a8 8 0 1 0-2.3 6.4", "M20 4v7h-7"],
  "chevron-left": ["M15 6l-6 6 6 6"],
  "chevron-right": ["M9 6l6 6-6 6"],
  "chevron-up": ["M6 15l6-6 6 6"],
  "chevron-down": ["M6 9l6 6 6-6"],
  "arrow-up": ["M12 19V5", "M5 12l7-7 7 7"],
  "arrow-down": ["M12 5v14", "M19 12l-7 7-7-7"],
  "arrow-right": ["M5 12h14", "M13 6l6 6-6 6"],
  trophy: [
    "M8 21h8",
    "M12 17v4",
    "M7 4h10v5a5 5 0 0 1-10 0z",
    "M17 5h3v2a3 3 0 0 1-3 3",
    "M7 5H4v2a3 3 0 0 0 3 3",
  ],
  mask: [
    "M3 9c0-1.5 1-2.5 2.5-2.5C8 6.5 9.5 8 12 8s4-1.5 6.5-1.5C20 6.5 21 7.5 21 9c0 4-2 7-5 7-2 0-3-1.5-4-1.5S10 16 8 16c-3 0-5-3-5-7z",
    "M6.5 10.5h3",
    "M14.5 10.5h3",
  ],
  "eye-off": [
    "M3 3l18 18",
    "M10.6 6.1A9.7 9.7 0 0 1 12 6c5 0 9 6 9 6a17 17 0 0 1-2.6 3.3",
    "M6.6 6.6C4.1 8.2 3 12 3 12s4 6 9 6c1.7 0 3.2-.6 4.5-1.4",
    "M9.9 9.9a3 3 0 0 0 4.2 4.2",
  ],
  send: ["M4 12l16-8-6 16-3-7z", "M11 13l9-9"],
  play: ["M7 5v14l12-7z"],
  alert: ["M12 3l10 18H2z", "M12 10v4", "M12 17.5h.01"],
  info: ["c:12,12,9", "M12 11v6", "M12 7.5h.01"],
  lock: ["r:5,11,14,10,2", "M8 11V8a4 4 0 0 1 8 0v3"],
  pencil: ["M4 20h4L19 9l-4-4L4 16z", "M14 6l4 4"],
  sparkle: ["M12 3l2 6.5 6.5 2.5-6.5 2-2 7-2-7-6.5-2L10 9.5z"],
  target: ["c:12,12,9", "c:12,12,5", "M12 12h.01"],
  "log-out": ["M9 4H5v16h4", "M16 8l4 4-4 4", "M20 12H9"],
  question: [
    "c:12,12,9",
    "M9.5 9.5a2.5 2.5 0 1 1 3.4 2.3c-.6.3-.9.8-.9 1.4V14",
    "M12 17.5h.01",
  ],
  ruler: [
    "M3.5 16.5L16.5 3.5l4 4-13 13z",
    "M7.5 12.5l2 2",
    "M10.5 9.5l1.5 1.5",
    "M13.5 6.5l2 2",
  ],
  flag: ["M5 21V4", "M5 4h12l-2.5 4L17 12H5"],
  vote: ["M4 13h16v7H4z", "M8 13l2-8h4l2 8", "M10 9h4"],
} as const;

export type IconName = keyof typeof ICONS;
export const iconNames = Object.keys(ICONS) as IconName[];

export interface IconProps {
  /** Which glyph. See iconNames for the full set (35). */
  name: IconName;
  /** Pixel size of the square. Default 20; 24 in buttons of size lg. */
  size?: number;
  /** Accessible name. Omit when the icon sits next to text that already says it (it is then hidden). */
  label?: string;
  className?: string;
}

/** One glyph from the system's icon set, drawn in currentColor. */
export const Icon = ({ name, size = 20, label, className }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    role={label ? "img" : undefined}
    aria-label={label}
    aria-hidden={label ? undefined : true}
    focusable="false"
    className={cx("shrink-0", className)}
  >
    {ICONS[name].map((d, i) => {
      if (d.startsWith("c:")) {
        const [cx_, cy, r] = d.slice(2).split(",").map(Number);
        return <circle key={i} cx={cx_} cy={cy} r={r} />;
      }
      if (d.startsWith("r:")) {
        const [x, y, w, h, rx] = d.slice(2).split(",").map(Number);
        return <rect key={i} x={x} y={y} width={w} height={h} rx={rx} />;
      }
      return <path key={i} d={d} />;
    })}
  </svg>
);
