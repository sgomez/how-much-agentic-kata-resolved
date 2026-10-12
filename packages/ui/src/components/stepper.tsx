import { useId } from "react";

import { cx } from "../lib/cx.ts";
import { formatNumber } from "../lib/format.ts";
import { IconButton } from "./icon-button.tsx";

export interface StepperProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  /** Default 1. */
  step?: number;
  /** Unit after the number: "s", "rondas". */
  unit?: string;
  /** Help line under the label. */
  hint?: string;
  disabled?: boolean;
}

/** A small number chosen with − and + (rounds, seconds per round). */
export const Stepper = ({
  label,
  value,
  onChange,
  min = 0,
  max = 99,
  step = 1,
  unit,
  hint,
  disabled,
}: StepperProps) => {
  const id = useId();
  const set = (v: number) => onChange(Math.min(max, Math.max(min, v)));
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <div id={id} className="text-ink font-bold">
          {label}
        </div>
        {hint ? <div className="text-ink-muted text-sm">{hint}</div> : null}
      </div>
      <div
        role="spinbutton"
        aria-labelledby={id}
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuetext={unit ? `${value} ${unit}` : String(value)}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (disabled) {
            return;
          }
          if (e.key === "ArrowUp" || e.key === "ArrowRight") {
            e.preventDefault();
            set(value + step);
          }
          if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
            e.preventDefault();
            set(value - step);
          }
          if (e.key === "Home") {
            e.preventDefault();
            set(min);
          }
          if (e.key === "End") {
            e.preventDefault();
            set(max);
          }
        }}
        className="flex shrink-0 items-center gap-2 rounded-md"
      >
        <IconButton
          icon="minus"
          label={`Menos ${label.toLowerCase()}`}
          tabIndex={-1}
          disabled={disabled || value <= min}
          onClick={() => set(value - step)}
        />
        <span
          className={cx(
            "condensed min-w-16 text-center text-heading font-extrabold",
            disabled ? "text-ink-muted" : "text-ink"
          )}
        >
          {formatNumber(value)}
          {unit ? (
            <span className="text-ink-muted ml-1 font-sans text-sm font-bold [font-variation-settings:normal]">
              {unit}
            </span>
          ) : null}
        </span>
        <IconButton
          icon="plus"
          label={`Más ${label.toLowerCase()}`}
          tabIndex={-1}
          disabled={disabled || value >= max}
          onClick={() => set(value + step)}
        />
      </div>
    </div>
  );
};
