import { cx } from "../lib/cx.ts";
import { formatNumber } from "../lib/format.ts";
import { competitionRanks } from "../lib/players.ts";
import { Avatar } from "./avatar.tsx";
import { Icon } from "./icon.tsx";
import { Scoreboard } from "./scoreboard.tsx";

export interface FinalPodiumProps {
  players: { id: string; name: string; score: number }[];
  youId?: string;
}

const STEP = {
  1: { h: "h-36", cls: "bg-primary text-on-primary", order: "order-2" },
  2: { h: "h-28", cls: "bg-surface-raised text-ink", order: "order-1" },
  3: { h: "h-20", cls: "bg-surface-raised text-ink", order: "order-3" },
} as const;

/** The end of the game: top three on a podium (ties share a step), everyone else ranked below. */
export const FinalPodium = ({ players, youId }: FinalPodiumProps) => {
  const sorted = players.toSorted(
    (a, b) => b.score - a.score || a.name.localeCompare(b.name, "es")
  );
  const ranks = competitionRanks(sorted.map((p) => p.score));
  const top = sorted
    .map((p, i) => ({ ...p, rank: ranks[i] ?? i + 1 }))
    .filter((p) => p.rank <= 3);
  const podium = top.slice(0, 3);
  const rest = sorted.slice(podium.length);
  return (
    <div className="flex flex-col gap-6">
      <ol
        className="m-0 flex list-none items-end justify-center gap-2 p-0 pt-6"
        aria-label="Podio"
      >
        {podium.map((p, i) => {
          const s = {
            ...STEP[p.rank as 1 | 2 | 3],
            order: STEP[(i + 1) as 1 | 2 | 3].order,
          };
          return (
            <li
              key={p.id}
              className={cx(
                "flex w-1/3 max-w-32 animate-rise flex-col items-center gap-2",
                s.order
              )}
              style={{ animationDelay: `${(3 - i) * 120}ms` }}
            >
              {p.rank === 1 ? (
                <Icon name="crown" size={28} className="text-ink" />
              ) : null}
              <Avatar player={p} size={p.rank === 1 ? "xl" : "lg"} />
              <span className="text-ink w-full truncate text-center font-bold">
                {p.name}
                {p.id === youId ? " (tú)" : ""}
              </span>
              <div
                className={cx(
                  "flex w-full flex-col items-center justify-start gap-0.5 rounded-t-lg border-2 border-b-0 border-line pt-2",
                  s.h,
                  s.cls
                )}
              >
                <span
                  className="condensed text-title font-black"
                  aria-label={`Puesto ${p.rank}`}
                >
                  {p.rank}º
                </span>
                <span className="condensed text-lg font-bold">
                  {formatNumber(p.score, 0)}{" "}
                  <span className="font-sans text-xs">pts</span>
                </span>
              </div>
            </li>
          );
        })}
      </ol>
      {rest.length ? (
        <Scoreboard rows={rest} youId={youId} startRank={podium.length + 1} />
      ) : null}
    </div>
  );
};
