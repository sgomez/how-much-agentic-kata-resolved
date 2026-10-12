import { cx } from "../lib/cx.ts";
import { initials, playerColorVar, playerInkVar } from "../lib/players.ts";
import { Icon } from "./icon.tsx";

export interface AvatarPlayer {
  id: string;
  name: string;
}

export interface AvatarProps {
  /** The player. The colour comes from player.id (stable on every phone), the letters from player.name. */
  player: AvatarPlayer;
  /** sm 28 · md 40 (default) · lg 56 · xl 80 px. */
  size?: "sm" | "md" | "lg" | "xl";
  /** Small corner mark: answered ✓, host crown, offline. Always also said in text nearby or in the label. */
  mark?: "answered" | "host" | "offline";
  /** Dim it (disconnected players, eliminated options). */
  dimmed?: boolean;
  /** When the avatar stands alone (no visible name next to it), set this so it gets an accessible name. */
  labelled?: boolean;
  className?: string;
}

const sizes = {
  sm: {
    box: "size-7 text-[10px] tracking-tight border-2",
    mark: "size-4 -right-1 -bottom-1",
    icon: 10,
  },
  md: {
    box: "size-10 text-sm border-2",
    mark: "size-5 -right-1 -bottom-1",
    icon: 12,
  },
  lg: {
    box: "size-14 text-lg border-2",
    mark: "size-6 -right-1 -bottom-1",
    icon: 14,
  },
  xl: {
    box: "size-20 text-2xl border-3",
    mark: "size-8 -right-1 -bottom-1",
    icon: 18,
  },
};
const markStyle = {
  answered: {
    cls: "bg-success text-on-success",
    icon: "check" as const,
    text: "ha respondido",
  },
  host: {
    cls: "bg-primary text-on-primary",
    icon: "crown" as const,
    text: "anfitrión",
  },
  offline: {
    cls: "bg-surface-sunken text-ink-muted",
    icon: "wifi-off" as const,
    text: "desconectado",
  },
};

/** A player's initials on their stable player colour. */
export const Avatar = ({
  player,
  size = "md",
  mark,
  dimmed,
  labelled,
  className,
}: AvatarProps) => {
  const s = sizes[size];
  const label = labelled
    ? [player.name, mark ? markStyle[mark].text : null]
        .filter(Boolean)
        .join(", ")
    : undefined;
  return (
    <span
      role={labelled ? "img" : undefined}
      aria-label={label}
      aria-hidden={labelled ? undefined : true}
      className={cx(
        "relative inline-flex shrink-0",
        dimmed && "opacity-45 grayscale",
        className
      )}
    >
      <span
        className={cx(
          "condensed inline-flex items-center justify-center rounded-full border-line font-extrabold leading-none select-none",
          s.box
        )}
        style={{
          backgroundColor: playerColorVar(player.id),
          color: playerInkVar(player.id),
        }}
      >
        {initials(player.name)}
      </span>
      {mark ? (
        <span
          className={cx(
            "absolute inline-flex items-center justify-center rounded-full border-2 border-line",
            s.mark,
            markStyle[mark].cls
          )}
        >
          <Icon name={markStyle[mark].icon} size={s.icon} />
        </span>
      ) : null}
    </span>
  );
};

export interface AvatarGroupProps {
  players: AvatarPlayer[];
  /** How many avatars to show before "+N". Default 5. */
  max?: number;
  size?: "sm" | "md";
  /** Optional per-player mark (e.g. answered). */
  markFor?: (player: AvatarPlayer) => AvatarProps["mark"] | undefined;
  className?: string;
}

/** Overlapping avatars with a "+N" overflow. Gets an accessible label listing who is in it. */
export const AvatarGroup = ({
  players,
  max = 5,
  size = "sm",
  markFor,
  className,
}: AvatarGroupProps) => {
  const shown = players.slice(0, max);
  const rest = players.length - shown.length;
  const names = players.map((p) => p.name);
  const label =
    names.length <= 6
      ? names.join(", ")
      : `${names.slice(0, 5).join(", ")} y ${names.length - 5} más`;
  return (
    <span
      role="img"
      aria-label={label}
      className={cx("inline-flex items-center", className)}
    >
      {shown.map((p, i) => (
        <Avatar
          key={p.id}
          player={p}
          size={size}
          mark={markFor?.(p)}
          className={cx(i > 0 && (size === "sm" ? "-ml-1.5" : "-ml-2"))}
        />
      ))}
      {rest > 0 ? (
        <span
          aria-hidden="true"
          className={cx(
            "condensed inline-flex items-center justify-center rounded-full border-2 border-line bg-surface-raised px-1.5 font-extrabold text-ink",
            size === "sm"
              ? "-ml-1.5 h-7 min-w-7 text-[11px]"
              : "-ml-2 h-10 min-w-10 text-sm"
          )}
        >
          +{rest}
        </span>
      ) : null}
    </span>
  );
};
