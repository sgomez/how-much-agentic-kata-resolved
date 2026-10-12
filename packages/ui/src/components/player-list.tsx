import { cx } from "../lib/cx.ts";
import { Avatar } from "./avatar.tsx";
import { Badge } from "./badge.tsx";
import { Icon } from "./icon.tsx";

export type PlayerStatus = "waiting" | "answered" | "disconnected";

export interface PlayerListItem {
  id: string;
  name: string;
  host?: boolean;
  /** waiting = still thinking (round) or just present (lobby); answered = estimate is in, value hidden; disconnected = polling stopped. */
  status?: PlayerStatus;
}

export interface PlayerListProps {
  players: PlayerListItem[];
  /** Id of the player using this phone: gets a "Tú" badge and goes first. */
  youId?: string;
  /** Show the answered / waiting column (round screens). In the lobby leave it off. */
  showAnswerStatus?: boolean;
  /** Text when the list is empty. */
  emptyText?: string;
}

const AnswerStatus = ({ answered }: { answered: boolean }) => (
  <div
    className={cx(
      "text-sm",
      answered ? "font-bold text-success-text" : "text-ink-muted"
    )}
  >
    {answered ? "Ya ha respondido" : "Pensando…"}
  </div>
);

const avatarMark = (
  player: PlayerListItem,
  showAnswerStatus: boolean
): "offline" | "answered" | undefined => {
  if (player.status === "disconnected") {
    return "offline";
  }
  return showAnswerStatus && player.status === "answered"
    ? "answered"
    : undefined;
};

/** Everyone in the game, with host, you, answered (never the value), waiting and disconnected. */
export const PlayerList = ({
  players,
  youId,
  showAnswerStatus = false,
  emptyText = "Aún no hay nadie. ¡Comparte el código!",
}: PlayerListProps) => {
  if (players.length === 0) {
    return (
      <p className="bg-surface-sunken text-ink-muted m-0 rounded-lg p-6 text-center">
        {emptyText}
      </p>
    );
  }
  const sorted = players.toSorted(
    (a, b) => Number(b.id === youId) - Number(a.id === youId)
  );
  return (
    <ul className="divide-line-subtle border-line bg-surface-raised m-0 flex list-none flex-col divide-y-2 overflow-hidden rounded-lg border-2 p-0">
      {sorted.map((p) => {
        const off = p.status === "disconnected";
        return (
          <li
            key={p.id}
            className={cx(
              "flex min-h-16 items-center gap-3 px-3 py-2",
              p.id === youId && "bg-primary/15"
            )}
          >
            <Avatar
              player={p}
              mark={avatarMark(p, showAnswerStatus)}
              dimmed={off}
            />
            <div className="min-w-0 flex-1">
              <div
                className={cx(
                  "truncate font-bold",
                  off ? "text-ink-muted" : "text-ink"
                )}
              >
                {p.name}
              </div>
              {off ? (
                <div className="text-ink-muted flex items-center gap-1 text-sm">
                  <Icon name="wifi-off" size={14} />
                  Desconectado
                </div>
              ) : null}
              {!off && showAnswerStatus ? (
                <AnswerStatus answered={p.status === "answered"} />
              ) : null}
            </div>
            <div className="flex shrink-0 gap-1.5">
              {p.host ? (
                <Badge tone="primary" icon="crown">
                  Anfitrión
                </Badge>
              ) : null}
              {p.id === youId ? (
                <Badge tone="neutral" variant="solid">
                  Tú
                </Badge>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
};
