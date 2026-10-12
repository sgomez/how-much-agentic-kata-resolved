import type { ReactNode } from "react";

export interface TopBarProps {
  /** Game code, shown small so players can read it to latecomers. */
  gameCode?: string;
  /** Current round (1-based) and total; shows "Ronda 3 / 10". */
  round?: number;
  totalRounds?: number;
  /** Optional right-side slot: a Countdown size="sm", or an IconButton. */
  trailing?: ReactNode;
  /** Optional left-side slot before the code (e.g. a back IconButton). */
  leading?: ReactNode;
}

/** The thin bar at the top of in-game screens: game code, round, countdown. */
export const TopBar = ({
  gameCode,
  round,
  totalRounds,
  trailing,
  leading,
}: TopBarProps) => (
  <header className="border-line-subtle bg-surface-raised z-(--z-bar) flex min-h-14 shrink-0 items-center gap-3 border-b-2 px-4 pt-[env(safe-area-inset-top)]">
    {leading}
    <div className="flex min-w-0 flex-1 items-center gap-3">
      {gameCode ? (
        <span
          className="condensed bg-surface-sunken text-ink rounded-sm px-2 py-0.5 text-lg font-extrabold tracking-widest"
          aria-label={`Partida ${gameCode.split("").join(" ")}`}
        >
          {gameCode}
        </span>
      ) : null}
      {round ? (
        <span className="text-ink-muted text-sm font-bold">
          Ronda <span className="condensed text-ink text-lg">{round}</span>
          {totalRounds ? (
            <span className="condensed text-lg"> / {totalRounds}</span>
          ) : null}
        </span>
      ) : null}
    </div>
    {trailing}
  </header>
);
