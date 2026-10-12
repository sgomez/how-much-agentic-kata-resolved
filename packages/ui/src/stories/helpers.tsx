import type { ReactNode } from "react";

/** Story decorator content: a phone-width column (360px) with the 16px gutter. */
export const Phone = ({ children }: { children: ReactNode }) => (
  <div className="bg-surface text-ink min-h-full p-4">
    <div className="mx-auto flex max-w-[328px] flex-col gap-4">{children}</div>
  </div>
);

/** A 360×800 device frame used by Patterns/ to put variants side by side. Not part of the system. */
export const PhoneFrame = ({
  label,
  note,
  children,
  height = 800,
}: {
  label: string;
  note?: string;
  children: ReactNode;
  height?: number;
}) => (
  <figure className="m-0 flex w-[360px] shrink-0 flex-col gap-2">
    <figcaption className="flex min-h-12 flex-col justify-end font-sans">
      <span className="text-ink text-sm font-bold">{label}</span>
      {note ? (
        <span className="text-ink-muted text-xs font-normal">{note}</span>
      ) : null}
    </figcaption>
    <div
      className="border-line-subtle bg-surface relative [transform:translateZ(0)] overflow-hidden rounded-[28px] border-2"
      style={{ width: 360, height, ["--screen-h" as string]: `${height}px` }}
    >
      {children}
    </div>
  </figure>
);

/** Lays PhoneFrames out side by side with a scrolling row. */
export const Frames = ({ children }: { children: ReactNode }) => (
  <div className="bg-surface-sunken flex min-h-screen items-start gap-6 overflow-x-auto p-6">
    {children}
  </div>
);
