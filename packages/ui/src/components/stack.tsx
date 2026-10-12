import type { ReactNode } from "react";

import { cx } from "../lib/cx.ts";

type Gap = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12;
const gapClass: Record<Gap, string> = {
  0: "gap-0",
  1: "gap-1",
  2: "gap-2",
  3: "gap-3",
  4: "gap-4",
  5: "gap-5",
  6: "gap-6",
  8: "gap-8",
  10: "gap-10",
  12: "gap-12",
};

export interface StackProps {
  /** col (default) stacks vertically; row lays out horizontally. */
  direction?: "col" | "row";
  /** Gap in spacing steps (4 = 16px, default). */
  gap?: Gap;
  align?: "start" | "center" | "end" | "stretch" | "baseline";
  justify?: "start" | "center" | "end" | "between";
  /** Let row items wrap onto new lines. */
  wrap?: boolean;
  /** Take the remaining space in a parent Stack (flex-1, min-h-0 so inner scrolling works). */
  grow?: boolean;
  as?: "div" | "section" | "ul" | "ol" | "form" | "header" | "footer";
  className?: string;
  children: ReactNode;
}

/** Lays children out in a column or row with a token gap. The only layout primitive you need besides Grid. */
export const Stack = ({
  direction = "col",
  gap = 4,
  align,
  justify,
  wrap,
  grow,
  as: Tag = "div",
  className,
  children,
}: StackProps) => (
  <Tag
    className={cx(
      "flex m-0 p-0 list-none",
      direction === "col" ? "flex-col" : "flex-row",
      gapClass[gap],
      align &&
        {
          start: "items-start",
          center: "items-center",
          end: "items-end",
          stretch: "items-stretch",
          baseline: "items-baseline",
        }[align],
      justify &&
        {
          start: "justify-start",
          center: "justify-center",
          end: "justify-end",
          between: "justify-between",
        }[justify],
      wrap && "flex-wrap",
      grow && "flex-1 min-h-0",
      className
    )}
  >
    {children}
  </Tag>
);

export interface GridProps {
  /** Number of equal columns. Default 2. */
  cols?: 2 | 3;
  gap?: 2 | 3 | 4;
  as?: "div" | "ul";
  className?: string;
  children: ReactNode;
}

/** Equal-width tiles (VoteOption, podium stats). */
export const Grid = ({
  cols = 2,
  gap = 3,
  as: Tag = "div",
  className,
  children,
}: GridProps) => (
  <Tag
    className={cx(
      "grid m-0 p-0 list-none",
      cols === 2 ? "grid-cols-2" : "grid-cols-3",
      { 2: "gap-2", 3: "gap-3", 4: "gap-4" }[gap],
      className
    )}
  >
    {children}
  </Tag>
);
