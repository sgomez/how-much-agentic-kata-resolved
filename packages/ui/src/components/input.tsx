import { useId } from "react";
import type { InputHTMLAttributes } from "react";

import { cx } from "../lib/cx.ts";
import { Icon } from "./icon.tsx";

export interface InputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "value" | "size"
> {
  /** Visible label above the field. Required: every field is labelled. */
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** Help under the field ("Así te verán los demás"). Replaced by error when there is one. */
  hint?: string;
  /** Error message; turns the field red and is announced. */
  error?: string;
}

/** A labelled single-line text field with hint and error. Font 16px so phones do not zoom in. */
export const Input = ({
  label,
  value,
  onChange,
  hint,
  error,
  id,
  className,
  maxLength,
  ...rest
}: InputProps) => {
  const autoId = useId();
  const inputId = id ?? autoId;
  const msgId = `${inputId}-msg`;
  return (
    <div className={cx("flex flex-col gap-2", className)}>
      <label htmlFor={inputId} className="text-ink text-sm font-bold">
        {label}
      </label>
      <input
        id={inputId}
        value={value}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={hint || error ? msgId : undefined}
        className={cx(
          "h-12 w-full rounded-md border-2 bg-surface-raised px-4 text-base text-ink placeholder:text-ink-muted",
          "transition-colors duration-(--duration-fast)",
          error ? "border-danger bg-danger-soft" : "border-line",
          "disabled:border-line-subtle disabled:bg-surface-sunken disabled:text-ink-muted"
        )}
        {...rest}
      />
      {error ? (
        <p
          id={msgId}
          role="alert"
          className="text-danger-text m-0 flex items-start gap-1.5 text-sm font-bold"
        >
          <Icon name="alert" size={16} className="mt-0.5" />
          {error}
        </p>
      ) : null}
      {!error && (hint || maxLength) ? (
        <p
          id={msgId}
          className="text-ink-muted m-0 flex justify-between gap-3 text-sm"
        >
          <span>{hint}</span>
          {maxLength ? (
            <span className="tabular-nums" aria-hidden="true">
              {value.length}/{maxLength}
            </span>
          ) : null}
        </p>
      ) : null}
    </div>
  );
};
