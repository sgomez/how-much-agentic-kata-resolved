import { cx } from "../lib/cx.ts";

export interface SpinnerProps {
  /** Pixel size. Default 20. */
  size?: number;
  /** Read by screen readers. Default "Cargando". Pass "" when a parent already announces the wait. */
  label?: string;
  className?: string;
}

/** An indeterminate wait indicator in currentColor. */
export const Spinner = ({
  size = 20,
  label = "Cargando",
  className,
}: SpinnerProps) => (
  <span
    role={label ? "status" : undefined}
    className={cx("inline-flex", className)}
  >
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="animate-spin"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="3"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
    {label ? <span className="sr-only">{label}</span> : null}
  </span>
);
