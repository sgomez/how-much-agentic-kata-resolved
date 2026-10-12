import { useLayoutEffect, useRef } from "react";

import { usePrefersReducedMotion } from "../lib/clock.ts";
import { cx } from "../lib/cx.ts";
import { formatNumber } from "../lib/format.ts";
import { competitionRanks } from "../lib/players.ts";
import { Avatar } from "./avatar.tsx";
import { Icon } from "./icon.tsx";
import { ScoreDelta } from "./score-delta.tsx";
import type { ScoreReason } from "./score-delta.tsx";

export interface ScoreRow {
  id: string;
  name: string;
  /** Total after this round. */
  score: number;
  /** Points won this round (shown as ScoreDelta). Omit for the final table. */
  delta?: number;
  deltaReason?: ScoreReason;
  /** Rank before this round, to show ▲2 / ▼1 movement. */
  previousRank?: number;
}

export interface ScoreboardProps {
  rows: ScoreRow[];
  youId?: string;
  /** Start numbering from here (FinalPodium passes 4 for "the rest"). Default 1. */
  startRank?: number;
}

/**
 * Ranking table: position, avatar, name, total and this round's delta. Ties share a position.
 * When rows reorder between renders they glide to their new place (FLIP), unless reduced motion.
 */
export const Scoreboard = ({ rows, youId, startRank = 1 }: ScoreboardProps) => {
  const sorted = rows.toSorted(
    (a, b) => b.score - a.score || a.name.localeCompare(b.name, "es")
  );
  const ranks = competitionRanks(sorted.map((r) => r.score)).map(
    (r) => r + startRank - 1
  );
  const els = useRef(new Map<string, HTMLLIElement>());
  const last = useRef(new Map<string, number>());
  const reduced = usePrefersReducedMotion();

  useLayoutEffect(() => {
    const next = new Map<string, number>();
    for (const [id, el] of els.current) {
      const top = el.offsetTop;
      next.set(id, top);
      const before = last.current.get(id);
      if (before !== undefined && before !== top && !reduced) {
        el.animate(
          [
            { transform: `translateY(${before - top}px)` },
            { transform: "none" },
          ],
          {
            duration: 420,
            easing: "cubic-bezier(0.6, 0, 0.2, 1)",
          }
        );
      }
    }
    last.current = next;
  });

  return (
    <ol
      className="m-0 flex list-none flex-col gap-2 p-0"
      aria-label="Clasificación"
    >
      {sorted.map((r, i) => {
        const rank = ranks[i] ?? i + startRank;
        const moved = r.previousRank ? r.previousRank - rank : 0;
        const you = r.id === youId;
        return (
          <li
            key={r.id}
            ref={(el) => {
              if (el) {
                els.current.set(r.id, el);
              } else {
                els.current.delete(r.id);
              }
            }}
            className={cx(
              "flex min-h-16 items-center gap-3 rounded-md border-2 px-3 py-2",
              you
                ? "border-line bg-primary/20"
                : "border-line-subtle bg-surface-raised"
            )}
          >
            <span
              className="condensed text-title text-ink w-8 shrink-0 text-center font-extrabold"
              aria-label={`Puesto ${rank}`}
            >
              {rank}
            </span>
            <Avatar player={r} />
            <div className="min-w-0 flex-1">
              <div className="text-ink truncate font-bold">
                {r.name}
                {you ? (
                  <span className="text-ink-muted font-normal"> (tú)</span>
                ) : null}
              </div>
              {moved !== 0 || r.delta !== undefined ? (
                <div className="mt-0.5 flex flex-wrap items-center gap-2">
                  {r.delta === undefined ? null : (
                    <ScoreDelta
                      points={r.delta}
                      reason={r.deltaReason}
                      size="sm"
                    />
                  )}
                  {moved === 0 ? null : (
                    <span
                      className={cx(
                        "flex items-center gap-0.5 text-xs font-bold",
                        moved > 0 ? "text-success-text" : "text-ink-muted"
                      )}
                    >
                      <Icon
                        name={moved > 0 ? "arrow-up" : "arrow-down"}
                        size={12}
                      />
                      {moved > 0 ? `Sube ${moved}` : `Baja ${-moved}`}
                    </span>
                  )}
                </div>
              ) : null}
            </div>
            <span
              className="condensed text-heading text-ink w-12 shrink-0 text-right font-extrabold"
              aria-label={`${r.score} puntos`}
            >
              {formatNumber(r.score, 0)}
            </span>
          </li>
        );
      })}
    </ol>
  );
};
