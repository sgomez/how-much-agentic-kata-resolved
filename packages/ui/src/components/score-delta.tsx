import { cx } from "../lib/cx.ts";
import { formatNumber } from "../lib/format.ts";
import { Icon } from "./icon.tsx";
import type { IconName } from "./icon.tsx";

export type ScoreReason = "closest" | "exact" | "impostor" | "caught";

export interface ScoreDeltaProps {
  points: number;
  /** Why: closest "+3" · exact "+2 ¡exacto!" · impostor "+5 impostor" · caught "+2 ¡pillado!". Omit for a plain number. */
  reason?: ScoreReason;
  size?: "sm" | "md";
  /** Pop in when it first appears (only on mount, never on re-render). Default true. */
  animate?: boolean;
}

const REASONS: Record<
  ScoreReason,
  { text: string; icon: IconName; cls: string }
> = {
  closest: { text: "", icon: "target", cls: "bg-primary text-on-primary" },
  exact: { text: "¡exacto!", icon: "sparkle", cls: "bg-accent text-on-accent" },
  impostor: { text: "impostor", icon: "mask", cls: "bg-ink text-surface" },
  caught: {
    text: "¡pillado!",
    icon: "check",
    cls: "bg-success text-on-success",
  },
};

/** Points won this round: "+3", "+2 ¡exacto!", "+5 impostor". Zero shows "+0" quietly. */
export const ScoreDelta = ({
  points,
  reason,
  size = "md",
  animate = true,
}: ScoreDeltaProps) => {
  const r = reason ? REASONS[reason] : null;
  const zero = points === 0;
  return (
    <span
      className={cx(
        "inline-flex shrink-0 items-center gap-1 rounded-full border-2 font-bold whitespace-nowrap",
        size === "sm" ? "h-6 px-2 text-xs" : "h-8 px-3 text-sm",
        zero
          ? "border-line-subtle bg-surface-sunken text-ink-muted"
          : cx("border-line", r?.cls ?? "bg-primary text-on-primary"),
        animate && !zero && "animate-pop"
      )}
    >
      {r && !zero ? (
        <Icon name={r.icon} size={size === "sm" ? 12 : 14} />
      ) : null}
      <span className="condensed text-[1.15em]">
        {points >= 0 ? "+" : "−"}
        {formatNumber(Math.abs(points), 0)}
      </span>
      {r?.text && !zero ? <span>{r.text}</span> : null}
    </span>
  );
};
