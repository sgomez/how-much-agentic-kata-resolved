import type { ReactNode } from "react";

import { Icon } from "./icon.tsx";
import type { IconName } from "./icon.tsx";

export interface DetailItem {
  label: string;
  value: ReactNode;
  icon?: IconName;
}

export interface DetailListProps {
  items: DetailItem[];
  /** Optional caption above ("Ajustes de la partida"). */
  title?: string;
}

/** Read-only label/value rows: the lobby settings as non-hosts see them. */
export const DetailList = ({ items, title }: DetailListProps) => (
  <div className="bg-surface-sunken rounded-lg p-4">
    {title ? (
      <p className="text-ink-muted m-0 mb-2 text-xs font-bold tracking-wide uppercase">
        {title}
      </p>
    ) : null}
    <dl className="divide-line-subtle m-0 divide-y">
      {items.map((it) => (
        <div
          key={it.label}
          className="flex min-h-11 items-center justify-between gap-4 py-2"
        >
          <dt className="text-ink-muted flex items-center gap-2">
            {it.icon ? <Icon name={it.icon} size={18} /> : null}
            {it.label}
          </dt>
          <dd className="text-ink m-0 text-right font-bold">{it.value}</dd>
        </div>
      ))}
    </dl>
  </div>
);
