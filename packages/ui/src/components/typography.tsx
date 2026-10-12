import type { ElementType, ReactNode } from "react";

import { cx } from "../lib/cx.ts";

export interface HeadingProps {
  /** Document outline level: 1 = screen title, 2 = section, 3 = sub-section. Default 2. */
  level?: 1 | 2 | 3;
  /** Visual size, independent of level. Default follows level: 1 → title, 2 → heading, 3 → lg. display = hero (verdict, podium, error screens). */
  size?: "display" | "title" | "heading" | "lg";
  align?: "start" | "center";
  className?: string;
  children: ReactNode;
}

const headingSize = {
  display:
    'font-display text-display font-extrabold [font-variation-settings:"wdth"_88] text-balance',
  title:
    'font-display text-title font-extrabold [font-variation-settings:"wdth"_88] text-balance',
  heading: "font-display text-heading font-bold text-balance",
  lg: "font-sans text-lg font-bold",
};

const DEFAULT_SIZE = { 1: "title", 2: "heading", 3: "lg" } as const;

/** A heading in the display face. Level sets the outline; size sets the look. */
export const Heading = ({
  level = 2,
  size,
  align = "start",
  className,
  children,
}: HeadingProps) => {
  const Tag = `h${level}` as ElementType;
  const s = size ?? DEFAULT_SIZE[level];
  return (
    <Tag
      className={cx(
        "m-0 text-ink",
        headingSize[s],
        align === "center" && "text-center",
        className
      )}
    >
      {children}
    </Tag>
  );
};

export type TextTone =
  | "default"
  | "muted"
  | "accent"
  | "success"
  | "warning"
  | "danger"
  | "info";

export interface TextProps {
  /** lg 18 · base 16 (default) · sm 14 · xs 12 (bold caps-friendly). */
  size?: "lg" | "base" | "sm" | "xs";
  /** Colour role. muted for hints; the status tones for short messages that also carry an icon or word. */
  tone?: TextTone;
  weight?: "regular" | "bold";
  align?: "start" | "center";
  /** Element to render. Default p. */
  as?: "p" | "span" | "div" | "label" | "strong";
  className?: string;
  children: ReactNode;
  id?: string;
}

export const toneText: Record<TextTone, string> = {
  default: "text-ink",
  muted: "text-ink-muted",
  accent: "text-accent-text",
  success: "text-success-text",
  warning: "text-warning-text",
  danger: "text-danger-text",
  info: "text-info-text",
};

/** Body text in the text face. */
export const Text = ({
  size = "base",
  tone = "default",
  weight = "regular",
  align = "start",
  as: Tag = "p",
  className,
  children,
  id,
}: TextProps) => (
  <Tag
    id={id}
    className={cx(
      "m-0",
      { lg: "text-lg", base: "text-base", sm: "text-sm", xs: "text-xs" }[size],
      toneText[tone],
      weight === "bold" || size === "xs" ? "font-bold" : "font-normal",
      align === "center" && "text-center",
      className
    )}
  >
    {children}
  </Tag>
);
