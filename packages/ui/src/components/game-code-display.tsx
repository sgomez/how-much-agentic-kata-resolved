import { useEffect, useState } from "react";

import { IconButton } from "./icon-button.tsx";

export interface GameCodeDisplayProps {
  code: string;
  /** Link that "Compartir" sends (your join URL). Share is hidden when the browser cannot share. */
  shareUrl?: string;
  /** Called after a successful copy, e.g. to show a Toast. The button also confirms with a check. */
  onCopied?: () => void;
}

/** The game code, huge and spaced, with copy and share. Legible from across a table. */
export const GameCodeDisplay = ({
  code,
  shareUrl,
  onCopied,
}: GameCodeDisplayProps) => {
  const [copied, setCopied] = useState(false);
  const canShare =
    typeof navigator !== "undefined" && typeof navigator.share === "function";
  useEffect(() => {
    if (!copied) {
      return;
    }
    const t = window.setTimeout(() => setCopied(false), 1500);
    return () => window.clearTimeout(t);
  }, [copied]);
  const spelled = code.split("").join(" ");
  return (
    <div className="border-line bg-primary text-on-primary shadow-sticker flex flex-col items-center gap-3 rounded-lg border-2 px-4 pt-3 pb-4">
      <span className="text-xs font-bold tracking-widest uppercase">
        Código de la partida
      </span>
      <span
        className="condensed text-code font-extrabold tracking-[0.18em] [font-variation-settings:'wdth'_90]"
        aria-label={spelled}
      >
        {code}
      </span>
      <div className="flex gap-3">
        <IconButton
          icon={copied ? "check" : "copy"}
          label={copied ? "Copiado" : "Copiar código"}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(code);
              setCopied(true);
              onCopied?.();
            } catch {
              /* clipboard blocked: the code is on screen anyway */
            }
          }}
        />
        {canShare ? (
          <IconButton
            icon="share"
            label="Compartir"
            onClick={async () => {
              try {
                await navigator.share({
                  title: "A ojo",
                  text: `Únete a mi partida: ${code}`,
                  url: shareUrl,
                });
              } catch {
                /* the player closed the share sheet */
              }
            }}
          />
        ) : null}
      </div>
    </div>
  );
};
