import type { ButtonHTMLAttributes } from "react";

import { cx } from "../lib/cx.ts";
import { Icon } from "./icon.tsx";
import type { IconName } from "./icon.tsx";

export interface IconButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "aria-label" | "type"
> {
  /** button (default) or submit, to send the form it sits in. */
  type?: "button" | "submit";
  icon: IconName;
  /** Required accessible name, also shown as the tooltip ("Copiar código"). */
  label: string;
  /** secondary (default) = outlined sticker; ghost = no border, for bars; primary = yellow. */
  variant?: "primary" | "secondary" | "ghost";
  /** md = 44px (default, minimum touch size). lg = 56px. */
  size?: "md" | "lg";
}

const variants = {
  primary:
    "bg-primary text-on-primary border-line shadow-sticker-sm hover:bg-primary-strong [--press-depth:2px]",
  secondary:
    "bg-surface-raised text-ink border-line shadow-sticker-sm hover:bg-surface-sunken [--press-depth:2px]",
  ghost:
    "bg-transparent text-ink border-transparent hover:bg-surface-sunken active:bg-surface-sunken [--press-depth:0px]",
};

/** A square button with only an icon. Always has a label for assistive tech. */
export const IconButton = ({
  icon,
  label,
  variant = "secondary",
  size = "md",
  type = "button",
  className,
  ...rest
}: IconButtonProps) => (
  <button
    type={type === "submit" ? "submit" : "button"}
    aria-label={label}
    title={label}
    className={cx(
      "pressable inline-flex shrink-0 select-none items-center justify-center rounded-md border-2",
      size === "lg" ? "size-14" : "size-touch",
      variants[variant],
      "disabled:bg-surface-sunken disabled:text-ink-muted disabled:border-line-subtle disabled:shadow-none",
      className
    )}
    {...rest}
  >
    <Icon name={icon} size={size === "lg" ? 28 : 22} />
  </button>
);
