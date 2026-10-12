import { cx } from "../lib/cx.ts";

export interface SkeletonProps {
  /** text = lines of copy (use lines), circle = avatar, block = card or button area. Default text. */
  shape?: "text" | "circle" | "block";
  /** Number of text lines. Default 1; the last of several is shorter. */
  lines?: number;
  /** CSS width/height for circle and block, e.g. 40 or "100%". */
  width?: number | string;
  height?: number | string;
  className?: string;
}

/** A placeholder while the first poll has not arrived. Never used for later polls (they keep the last value). */
export const Skeleton = ({
  shape = "text",
  lines = 1,
  width,
  height,
  className,
}: SkeletonProps) => {
  const base =
    "block bg-surface-sunken bg-[linear-gradient(90deg,transparent,rgb(128_128_128/0.18),transparent)] bg-size-[200%_100%] animate-shimmer";
  if (shape === "text") {
    return (
      <span aria-hidden="true" className={cx("flex flex-col gap-2", className)}>
        {Array.from({ length: lines }, (_, i) => (
          <span
            key={i}
            className={cx(
              base,
              "h-4 rounded-sm",
              i === lines - 1 && lines > 1 ? "w-3/5" : "w-full"
            )}
            style={width && lines === 1 ? { width } : undefined}
          />
        ))}
      </span>
    );
  }
  return (
    <span
      aria-hidden="true"
      className={cx(
        base,
        shape === "circle" ? "rounded-full" : "rounded-lg",
        className
      )}
      style={{
        width: width ?? (shape === "circle" ? 40 : "100%"),
        height: height ?? (shape === "circle" ? 40 : 96),
      }}
    />
  );
};
