import { cx } from "../lib/cx.ts";
import { decimalsOf, formatSigned, formatWithUnit } from "../lib/format.ts";
import { Avatar } from "./avatar.tsx";
import { Badge } from "./badge.tsx";
import { Icon } from "./icon.tsx";
import { ScoreDelta } from "./score-delta.tsx";
import type { ScoreReason } from "./score-delta.tsx";

export interface RevealListEntry {
  player: { id: string; name: string };
  /** null = "Sin respuesta". */
  value: number | null;
  /** Points won this round from your server. Omit to hide the column. */
  points?: number;
  reason?: ScoreReason;
  /** Not competing (impostor variant): listed apart under "Fuera de concurso". */
  excluded?: boolean;
}

export interface RevealListProps {
  unit: string;
  solution: number;
  entries: RevealListEntry[];
  youId?: string;
  /** Decimal step of the question, for formatting. Default 1. */
  step?: number;
}

/** How far an estimate fell from the solution: "¡Exacto!" or a signed distance with an arrow. */
const Distance = ({
  diff,
  unit,
  decimals,
}: {
  diff: number;
  unit: string;
  decimals: number;
}) => {
  if (diff === 0) {
    return (
      <span className="text-accent-text inline-flex items-center gap-0.5 font-bold">
        <Icon name="sparkle" size={12} />
        ¡Exacto!
      </span>
    );
  }
  const over = diff > 0;
  return (
    <span className="text-ink-muted inline-flex items-center gap-0.5">
      <Icon name={over ? "arrow-up" : "arrow-down"} size={12} />
      <span className="sr-only">
        {over ? "se pasó por" : "se quedó corto por"}
      </span>
      <span className="condensed">{formatSigned(diff, unit, decimals)}</span>
    </span>
  );
};

const distanceTo = (solution: number, entry: RevealListEntry): number =>
  entry.value === null
    ? Number.POSITIVE_INFINITY
    : Math.abs(entry.value - solution);

/**
 * The reveal as text: every estimate sorted by distance to the solution, how far off it was,
 * and the points. Closest rows are highlighted; no-shows and excluded players go last.
 */
export const RevealList = ({
  unit,
  solution,
  entries,
  youId,
  step = 1,
}: RevealListProps) => {
  const d = decimalsOf(step);
  const competing = entries
    .filter((e) => e.value !== null && !e.excluded)
    .toSorted((a, b) => distanceTo(solution, a) - distanceTo(solution, b));
  const [closest] = competing;
  const best = closest === undefined ? null : distanceTo(solution, closest);
  const excluded = entries.filter((e) => e.value !== null && e.excluded);
  const missing = entries.filter((e) => e.value === null);

  const row = (e: RevealListEntry, highlight: boolean) => (
    <li
      key={e.player.id}
      className={cx(
        "flex min-h-14 items-center gap-3 rounded-md border-2 px-3 py-2",
        highlight
          ? "border-line bg-primary/25"
          : "border-line-subtle bg-surface-raised",
        e.excluded && "border-dashed"
      )}
    >
      <Avatar player={e.player} size="md" dimmed={e.value === null} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-ink truncate font-bold">{e.player.name}</span>
          {e.player.id === youId ? (
            <span className="text-ink-muted">(tú)</span>
          ) : null}
          {highlight ? (
            <Badge tone="primary" icon="target" variant="solid">
              Más cerca
            </Badge>
          ) : null}
        </div>
        {e.value === null ? (
          <div className="text-ink-muted text-sm">Sin respuesta</div>
        ) : (
          <div className="flex flex-wrap items-baseline gap-x-2 text-sm">
            <span className="condensed text-ink text-base font-bold">
              {formatWithUnit(e.value, unit, d)}
            </span>
            <Distance diff={e.value - solution} unit={unit} decimals={d} />
          </div>
        )}
      </div>
      {e.points === undefined ? null : (
        <ScoreDelta points={e.points} reason={e.reason} size="sm" />
      )}
    </li>
  );

  return (
    <div className="flex flex-col gap-4">
      <ol
        className="m-0 flex list-none flex-col gap-2 p-0"
        aria-label="Estimaciones de esta ronda"
      >
        {competing.map((e) =>
          row(e, best !== null && distanceTo(solution, e) === best)
        )}
      </ol>
      {excluded.length ? (
        <div className="flex flex-col gap-2">
          <p className="text-ink-muted m-0 flex items-center gap-1.5 text-xs font-bold tracking-wide uppercase">
            <Icon name="mask" size={14} />
            Fuera de concurso
          </p>
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {excluded.map((e) => row(e, false))}
          </ul>
        </div>
      ) : null}
      {missing.length ? (
        <ul
          className="m-0 flex list-none flex-col gap-2 p-0"
          aria-label="Sin respuesta"
        >
          {missing.map((e) => row(e, false))}
        </ul>
      ) : null}
    </div>
  );
};
