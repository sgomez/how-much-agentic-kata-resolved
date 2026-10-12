import { cx } from "../lib/cx.ts";
import { Avatar } from "./avatar.tsx";
import { Icon } from "./icon.tsx";

export interface VoteOptionProps {
  player: { id: string; name: string };
  /** This is the player's current pick. */
  selected?: boolean;
  /** The vote has been sent. With locked it cannot change ("Tu voto"); without, tapping another tile changes it. */
  voted?: boolean;
  /** The vote is final: tiles stop responding. */
  locked?: boolean;
  /** Not votable (yourself when self-votes are forbidden). Pass a reason in note. */
  disabled?: boolean;
  /** Small line under the name: "Eres tú", "3 votos". */
  note?: string;
  onSelect?: () => void;
}

const badgeIcon = (voted: boolean, locked: boolean) => {
  if (!voted) {
    return "vote";
  }
  return locked ? "lock" : "check";
};

/** A player tile to vote for as the impostor. Use inside a Grid cols={2}. */
export const VoteOption = ({
  player,
  selected,
  voted,
  locked,
  disabled,
  note,
  onSelect,
}: VoteOptionProps) => {
  const inert = disabled || locked;
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      aria-disabled={locked || undefined}
      onClick={inert ? undefined : onSelect}
      className={cx(
        "pressable relative flex min-h-36 flex-col items-center justify-center gap-2 rounded-lg px-2 py-3 text-center",
        selected
          ? "border-3 border-line bg-primary text-on-primary shadow-sticker"
          : "border-2 border-line bg-surface-raised text-ink shadow-sticker hover:bg-surface-sunken",
        disabled &&
          "border-dashed border-line-subtle bg-surface-sunken text-ink-muted shadow-none hover:bg-surface-sunken",
        locked && !selected && "opacity-55 shadow-none",
        locked && "[--press-depth:0px] cursor-default"
      )}
    >
      {selected ? (
        <span className="border-line bg-surface-raised text-ink absolute top-2 right-2 inline-flex size-7 items-center justify-center rounded-full border-2">
          <Icon name={badgeIcon(voted === true, locked === true)} size={16} />
        </span>
      ) : null}
      <Avatar player={player} size="lg" dimmed={disabled} />
      <span className="w-full truncate font-bold">{player.name}</span>
      {selected && voted ? (
        <span className="text-xs font-bold">
          {locked ? "Tu voto (definitivo)" : "Tu voto · puedes cambiarlo"}
        </span>
      ) : null}
      {!(selected && voted) && note ? (
        <span
          className={cx("text-xs", selected ? "font-bold" : "text-ink-muted")}
        >
          {note}
        </span>
      ) : null}
    </button>
  );
};
