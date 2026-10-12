import type { ReactNode } from "react";

import { cx } from "../lib/cx.ts";

export interface CardProps {
  /** raised (default) = white sticker card · sunken = well for read-only info · primary = yellow highlight · accent = pink highlight. */
  tone?: "raised" | "sunken" | "primary" | "accent";
  /** Inner padding. md = 16px (default), lg = 24px, none = edge-to-edge content (lists). */
  padding?: "none" | "md" | "lg";
  as?: "div" | "section" | "article";
  className?: string;
  children: ReactNode;
  "aria-label"?: string;
  "aria-labelledby"?: string;
}

const tones = {
  raised: "bg-surface-raised text-ink border-2 border-line shadow-sticker",
  sunken: "bg-surface-sunken text-ink border-2 border-transparent",
  primary: "bg-primary text-on-primary border-2 border-line shadow-sticker",
  accent: "bg-accent text-on-accent border-2 border-line shadow-sticker",
};

/** A container that groups related content on a raised or sunken ground. */
export const Card = ({
  tone = "raised",
  padding = "md",
  as: Tag = "div",
  className,
  children,
  ...aria
}: CardProps) => (
  <Tag
    className={cx(
      "rounded-lg",
      tones[tone],
      { none: "p-0 overflow-hidden", md: "p-4", lg: "p-6" }[padding],
      className
    )}
    {...aria}
  >
    {children}
  </Tag>
);
