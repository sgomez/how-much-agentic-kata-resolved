import { cx } from "../lib/cx.ts";
import { Avatar } from "./avatar.tsx";
import { Icon } from "./icon.tsx";
import { ScoreDelta } from "./score-delta.tsx";

export interface VoteRecord {
  voter: { id: string; name: string };
  /** null = did not vote. */
  target: { id: string; name: string } | null;
}

export interface VerdictCardProps {
  /** caught = most votes went to the impostor · escaped = not caught · none = no verdict (tie, when your rules say so). */
  outcome: "caught" | "escaped" | "none";
  impostor: { id: string; name: string };
  /** Points the impostor gets (5 when escaped, 0 when caught). Omit to hide. */
  impostorPoints?: number;
  /** Optional: who voted for whom. Leave out for the "only the verdict" variant. */
  votes?: VoteRecord[];
  /** Short reason line for 'none' or ties ("Empate a 3 votos"). */
  detail?: string;
}

const OUT = {
  caught: {
    title: "¡Pillado!",
    sub: "era el impostor",
    icon: "check" as const,
    cls: "bg-success text-on-success",
  },
  escaped: {
    title: "¡Se ha escapado!",
    sub: "era el impostor y nadie le pilló",
    icon: "mask" as const,
    cls: "bg-accent text-on-accent",
  },
  none: {
    title: "Sin veredicto",
    sub: "era el impostor",
    icon: "question" as const,
    cls: "bg-surface-sunken text-ink",
  },
};

/** Reveals who the impostor was and whether the players caught them, optionally with every vote. */
export const VerdictCard = ({
  outcome,
  impostor,
  impostorPoints,
  votes,
  detail,
}: VerdictCardProps) => {
  const o = OUT[outcome];
  return (
    <section
      aria-label="Veredicto"
      className="border-line bg-surface-raised shadow-sticker overflow-hidden rounded-lg border-2"
    >
      <div className={cx("flex items-center gap-2 px-4 py-3", o.cls)}>
        <Icon name={o.icon} size={24} />
        <h2 className="font-display text-title m-0 font-extrabold">
          {o.title}
        </h2>
      </div>
      <div className="flex items-center gap-4 p-4">
        <Avatar player={impostor} size="xl" className="animate-pop" />
        <div className="min-w-0 flex-1">
          <p className="font-display text-heading text-ink m-0 font-bold">
            {impostor.name}
          </p>
          <p className="text-ink-muted m-0">{o.sub}</p>
          {detail ? (
            <p className="text-ink m-0 mt-1 text-sm font-bold">{detail}</p>
          ) : null}
          {impostorPoints === undefined ? null : (
            <div className="mt-2">
              <ScoreDelta points={impostorPoints} reason="impostor" />
            </div>
          )}
        </div>
      </div>
      {votes && votes.length ? (
        <div className="border-line-subtle border-t-2 px-4 pt-3 pb-4">
          <p className="text-ink-muted m-0 mb-2 text-xs font-bold tracking-wide uppercase">
            Quién votó a quién
          </p>
          <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
            {votes.map((v) => {
              const hit = v.target?.id === impostor.id;
              return (
                <li
                  key={v.voter.id}
                  className="flex min-h-9 items-center gap-2 text-sm"
                >
                  <Avatar player={v.voter} size="sm" />
                  <span className="text-ink min-w-0 flex-1 truncate font-bold">
                    {v.voter.name}
                  </span>
                  <Icon
                    name="arrow-right"
                    size={14}
                    className="text-ink-muted"
                  />
                  {v.target ? (
                    <>
                      <Avatar player={v.target} size="sm" />
                      <span
                        className={cx(
                          "w-24 truncate",
                          hit ? "font-bold text-success-text" : "text-ink"
                        )}
                      >
                        {v.target.name}
                      </span>
                      <span className="w-5">
                        {hit ? (
                          <Icon
                            name="check"
                            size={16}
                            label="acertó"
                            className="text-success-text"
                          />
                        ) : null}
                      </span>
                    </>
                  ) : (
                    <span className="text-ink-muted w-36">No votó</span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </section>
  );
};
