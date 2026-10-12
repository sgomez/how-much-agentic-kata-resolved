import { cx } from "../lib/cx.ts";
import { Icon } from "./icon.tsx";
import type { IconName } from "./icon.tsx";

export interface ChipOption {
  value: string;
  label: string;
  icon?: IconName;
}

export interface ChipGroupProps {
  /** Visible group label ("Paquetes de preguntas"). */
  label: string;
  options: ChipOption[];
  /** Selected values. ChipGroup is always multi-select; for one-of-many use SegmentedControl. */
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}

/** Wrapping toggle chips for picking several options (question packs). */
export const ChipGroup = ({
  label,
  options,
  value,
  onChange,
  disabled,
}: ChipGroupProps) => {
  const toggle = (v: string) =>
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  return (
    <fieldset
      className="m-0 flex flex-col gap-2 border-0 p-0"
      disabled={disabled}
    >
      <legend className="text-ink mb-2 p-0 text-sm font-bold">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = value.includes(o.value);
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(o.value)}
              className={cx(
                "pressable inline-flex min-h-touch items-center gap-1.5 rounded-md border-2 px-3 text-sm font-bold [--press-depth:2px]",
                on
                  ? "border-line bg-primary text-on-primary shadow-sticker-sm"
                  : "border-line-subtle bg-surface-raised text-ink hover:border-line",
                "disabled:border-line-subtle disabled:bg-surface-sunken disabled:text-ink-muted disabled:shadow-none"
              )}
            >
              {on || o.icon ? (
                <Icon name={on ? "check" : (o.icon ?? "check")} size={16} />
              ) : null}
              {o.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
};
