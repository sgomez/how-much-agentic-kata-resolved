import { Avatar, AvatarGroup } from "./avatar.tsx";

export interface AnswerTrackerProps {
  players: { id: string; name: string; answered: boolean }[];
  /** One line for tight screens (the round screen): the count plus the first answered avatars. */
  compact?: boolean;
}

/** "7 de 12 han respondido" with a row of avatars: answered ones first, ticked. Never shows values. */
export const AnswerTracker = ({
  players,
  compact = false,
}: AnswerTrackerProps) => {
  const done = players.filter((p) => p.answered).length;
  const sorted = players.toSorted(
    (a, b) => Number(b.answered) - Number(a.answered)
  );
  const all = done === players.length && players.length > 0;
  if (compact) {
    const answered = sorted.filter((p) => p.answered);
    return (
      <div
        className="text-ink-muted flex min-h-7 items-center justify-center gap-2 text-sm"
        aria-live="polite"
      >
        {answered.length ? <AvatarGroup players={answered} max={4} /> : null}
        {all ? (
          <strong className="text-success-text">
            ¡Ya habéis respondido todos!
          </strong>
        ) : (
          <span>
            <strong className="condensed text-ink text-base">{done}</strong> de{" "}
            <span className="condensed text-base">{players.length}</span> han
            respondido
          </span>
        )}
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      <p className="text-ink-muted m-0 text-sm" aria-live="polite">
        {all ? (
          <strong className="text-success-text">
            ¡Ya habéis respondido todos!
          </strong>
        ) : (
          <>
            <strong className="condensed text-ink text-base">{done}</strong> de{" "}
            <span className="condensed text-base">{players.length}</span> han
            respondido
          </>
        )}
      </p>
      <ul
        className="m-0 flex list-none flex-wrap gap-1.5 p-0"
        aria-label="Quién ha respondido"
      >
        {sorted.map((p) => (
          <li key={p.id} className={p.answered ? undefined : "opacity-40"}>
            <Avatar
              player={p}
              size="sm"
              mark={p.answered ? "answered" : undefined}
              labelled
            />
          </li>
        ))}
      </ul>
    </div>
  );
};
