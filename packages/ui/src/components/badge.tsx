import type { ReactNode } from "react";

import { cx } from "../lib/cx.ts";
import { Icon } from "./icon.tsx";
import type { IconName } from "./icon.tsx";

export type BadgeTone =
  | "neutral"
  | "primary"
  | "accent"
  | "success"
  | "warning"
  | "danger"
  | "info";

export interface BadgeProps {
  /** Meaning of the badge. Pair any status tone with an icon or a clear word. Default neutral. */
  tone?: BadgeTone;
  icon?: IconName;
  /** soft (default) = tinted ground; solid = filled, for the one badge that must pop. */
  variant?: "soft" | "solid";
  className?: string;
  children: ReactNode;
}

const soft: Record<BadgeTone, string> = {
  neutral: "bg-surface-sunken text-ink-muted",
  primary: "bg-primary/30 text-ink",
  accent: "bg-accent/15 text-accent-text",
  success: "bg-success-soft text-success-text",
  warning: "bg-warning-soft text-warning-text",
  danger: "bg-danger-soft text-danger-text",
  info: "bg-info-soft text-info-text",
};
const solid: Record<BadgeTone, string> = {
  neutral: "bg-ink text-surface",
  primary: "bg-primary text-on-primary",
  accent: "bg-accent text-on-accent",
  success: "bg-success text-on-success",
  warning: "bg-warning text-on-warning",
  danger: "bg-danger text-on-danger",
  info: "bg-info text-on-info",
};

/** A short status label: "Anfitrión", "Tú", "Enviado", "Impostor". */
export const Badge = ({
  tone = "neutral",
  icon,
  variant = "soft",
  className,
  children,
}: BadgeProps) => (
  <span
    className={cx(
      "inline-flex h-6 shrink-0 items-center gap-1 rounded-sm px-2 text-xs font-bold whitespace-nowrap",
      variant === "soft" ? soft[tone] : solid[tone],
      className
    )}
  >
    {icon ? <Icon name={icon} size={14} /> : null}
    {children}
  </span>
);
