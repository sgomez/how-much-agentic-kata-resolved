import { useId } from "react";

import { cx } from "../lib/cx.ts";
import { Icon } from "./icon.tsx";

export interface SwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** One line explaining what it does ("Un jugador no verá la pregunta"). */
  description?: string;
  disabled?: boolean;
}

/** An on/off setting (impostor mode). The whole row is the touch target. */
export const Switch = ({
  label,
  checked,
  onChange,
  description,
  disabled,
}: SwitchProps) => {
  const id = useId();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={`${id}-l`}
      aria-describedby={description ? `${id}-d` : undefined}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="group min-h-touch flex w-full items-center justify-between gap-4 rounded-md text-left disabled:cursor-not-allowed"
    >
      <span className="min-w-0">
        <span
          id={`${id}-l`}
          className={cx(
            "block font-bold",
            disabled ? "text-ink-muted" : "text-ink"
          )}
        >
          {label}
        </span>
        {description ? (
          <span id={`${id}-d`} className="text-ink-muted block text-sm">
            {description}
          </span>
        ) : null}
      </span>
      <span
        aria-hidden="true"
        className={cx(
          "relative inline-flex h-8 w-14 shrink-0 items-center rounded-full border-2 transition-colors duration-(--duration-fast)",
          checked ? "border-line bg-primary" : "border-line bg-surface-sunken",
          disabled && "border-line-subtle opacity-60"
        )}
      >
        <span
          className={cx(
            "absolute left-0.5 inline-flex size-6 items-center justify-center rounded-full border-2 border-line bg-surface-raised text-ink transition-transform duration-(--duration-fast) ease-out",
            checked && "translate-x-6"
          )}
        >
          {checked ? <Icon name="check" size={14} /> : null}
        </span>
      </span>
    </button>
  );
};
