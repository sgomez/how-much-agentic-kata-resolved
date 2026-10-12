import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cx } from "../lib/cx.ts";
import { Icon } from "./icon.tsx";
import type { IconName } from "./icon.tsx";
import { Spinner } from "./spinner.tsx";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export interface ButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "type"
> {
  /** button (default) or submit, to send the form it sits in. */
  type?: "button" | "submit";
  /** primary = the one main action of the screen (yellow). secondary = alternatives. ghost = low-emphasis. danger = destructive. Default primary. */
  variant?: ButtonVariant;
  /** md = 48px tall (default). lg = 56px, for the main action in BottomActionBar. */
  size?: "md" | "lg";
  /** Shows a spinner, keeps the label (no width jump) and blocks presses. */
  loading?: boolean;
  /** Stretches to the container width. */
  fullWidth?: boolean;
  /** Optional leading icon. */
  icon?: IconName;
  children: ReactNode;
}

export const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-on-primary border-line shadow-sticker hover:bg-primary-strong",
  secondary:
    "bg-surface-raised text-ink border-line shadow-sticker hover:bg-surface-sunken",
  ghost:
    "bg-transparent text-ink border-transparent hover:bg-surface-sunken active:bg-surface-sunken [--press-depth:0px]",
  danger: "bg-danger text-on-danger border-line shadow-sticker",
};

const disabledLook =
  "disabled:bg-surface-sunken disabled:text-ink-muted disabled:border-line-subtle disabled:shadow-none disabled:hover:bg-surface-sunken";

/** A labelled action. One primary Button per screen; put it in BottomActionBar. */
export const Button = ({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  icon,
  type = "button",
  disabled,
  className,
  children,
  onClick,
  ...rest
}: ButtonProps) => (
  <button
    type={type === "submit" ? "submit" : "button"}
    disabled={disabled}
    aria-busy={loading || undefined}
    aria-disabled={loading || undefined}
    onClick={loading ? undefined : onClick}
    className={cx(
      "pressable inline-flex select-none items-center justify-center gap-2 rounded-md border-2 font-bold whitespace-nowrap",
      size === "lg" ? "h-14 px-6 text-lg" : "h-12 px-5 text-base",
      fullWidth && "w-full",
      buttonVariants[variant],
      disabledLook,
      loading && "cursor-progress",
      className
    )}
    {...rest}
  >
    {loading ? <Spinner size={size === "lg" ? 22 : 20} label="" /> : null}
    {!loading && icon ? (
      <Icon name={icon} size={size === "lg" ? 22 : 20} />
    ) : null}
    <span>{children}</span>
  </button>
);
