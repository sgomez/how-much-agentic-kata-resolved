import type { ReactNode } from "react";

import { cx } from "../lib/cx.ts";
import { Icon } from "./icon.tsx";
import type { IconName } from "./icon.tsx";

export interface EmptyStateProps {
  icon?: IconName;
  /** One short line: "Aún no hay nadie". */
  title: string;
  /** What happens next or what to do: "Comparte el código para que se unan". */
  description?: ReactNode;
  /** tone of the icon disc. danger for errors (unknown game, game closed). Default neutral. */
  tone?: "neutral" | "danger" | "warning";
  /** Optional action, usually a Button. */
  action?: ReactNode;
  className?: string;
}

const discs = {
  neutral: "bg-surface-sunken text-ink",
  danger: "bg-danger-soft text-danger-text",
  warning: "bg-warning-soft text-warning-text",
};

/** Centered icon, title, help text and optional action for empty lists and error screens. */
export const EmptyState = ({
  icon = "info",
  title,
  description,
  tone = "neutral",
  action,
  className,
}: EmptyStateProps) => (
  <div
    className={cx(
      "flex flex-col items-center gap-3 px-6 py-8 text-center",
      className
    )}
  >
    <span
      className={cx(
        "mb-1 inline-flex size-16 items-center justify-center rounded-full",
        discs[tone]
      )}
    >
      <Icon name={icon} size={30} />
    </span>
    <p className="font-display text-heading text-ink m-0 font-bold text-balance">
      {title}
    </p>
    {description ? (
      <div className="text-ink-muted max-w-72 text-base text-pretty">
        {description}
      </div>
    ) : null}
    {action ? <div className="mt-2">{action}</div> : null}
  </div>
);
