import { useId, useRef } from "react";

import { cx } from "../lib/cx.ts";

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

export interface SegmentedControlProps<T extends string> {
  /** Accessible and visible label. */
  label: string;
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
}

/** Pick exactly one of 2–4 short options. Arrow keys move the selection. */
export const SegmentedControl = <T extends string>({
  label,
  options,
  value,
  onChange,
  disabled,
}: SegmentedControlProps<T>) => {
  const id = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const move = (i: number) => {
    const n = (i + options.length) % options.length;
    const option = options[n];
    if (option === undefined) {
      return;
    }
    onChange(option.value);
    refs.current[n]?.focus();
  };
  return (
    <div className="flex flex-col gap-2">
      <span id={id} className="text-ink text-sm font-bold">
        {label}
      </span>
      <div
        role="radiogroup"
        aria-labelledby={id}
        className="border-line bg-surface-sunken flex rounded-full border-2 p-1"
      >
        {options.map((o, i) => {
          const on = o.value === value;
          return (
            <button
              key={o.value}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={on}
              tabIndex={on ? 0 : -1}
              disabled={disabled}
              onClick={() => onChange(o.value)}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                  e.preventDefault();
                  move(i + 1);
                }
                if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                  e.preventDefault();
                  move(i - 1);
                }
              }}
              className={cx(
                "min-h-10 flex-1 rounded-full px-3 text-sm font-bold transition-colors duration-(--duration-fast)",
                on ? "bg-ink text-surface" : "text-ink-muted hover:text-ink",
                "disabled:text-ink-muted"
              )}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
