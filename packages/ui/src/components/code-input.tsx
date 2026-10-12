import { useId, useState } from "react";

import { cx } from "../lib/cx.ts";
import { Icon } from "./icon.tsx";

export type CodeAlphabet = "letters" | "digits" | "alphanumeric";

export interface CodeInputProps {
  /** Visible label. Default "Código de la partida". */
  label?: string;
  value: string;
  onChange: (value: string) => void;
  /** Called once when the last character is typed or a full code is pasted. */
  onComplete?: (value: string) => void;
  /** Number of characters. Default 4. */
  length?: number;
  /** Which characters are accepted. Others are dropped as you type or paste. Default letters. */
  alphabet?: CodeAlphabet;
  error?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

const FILTER: Record<CodeAlphabet, RegExp> = {
  letters: /[^A-Z]/gu,
  digits: /[^0-9]/gu,
  alphanumeric: /[^A-Z0-9]/gu,
};

const HINT: Record<CodeAlphabet, string> = {
  letters: "letras",
  digits: "números",
  alphanumeric: "letras o números",
};

/** Normalises any text into a valid code: uppercase, accents removed, alphabet-filtered, cut to length. */
export const normalizeCode = (
  raw: string,
  alphabet: CodeAlphabet,
  length: number
): string =>
  raw
    .normalize("NFD")
    .replaceAll(/\p{M}/gu, "")
    .toUpperCase()
    .replace(FILTER[alphabet], "")
    .slice(0, length);

/**
 * Big character boxes for the game code. It is one real input under the boxes, so paste,
 * autofill, the phone keyboard and screen readers all work; the boxes only draw it.
 */
export const CodeInput = ({
  label = "Código de la partida",
  value,
  onChange,
  onComplete,
  length = 4,
  alphabet = "letters",
  error,
  disabled,
  autoFocus,
}: CodeInputProps) => {
  const id = useId();
  const [focused, setFocused] = useState(false);
  const chars = value.split("");
  const active = Math.min(value.length, length - 1);
  const hint = `${length} ${HINT[alphabet]}`;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-ink text-sm font-bold">
        {label}
      </label>
      {/* The transparent input covers the boxes, so a tap on any box focuses it. */}
      <div className="relative">
        <input
          id={id}
          value={value}
          disabled={disabled}
          autoFocus={autoFocus}
          inputMode={alphabet === "digits" ? "numeric" : "text"}
          autoCapitalize="characters"
          autoComplete="one-time-code"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="go"
          maxLength={length * 4}
          aria-invalid={error ? true : undefined}
          aria-describedby={`${id}-msg`}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => {
            const next = normalizeCode(e.target.value, alphabet, length);
            onChange(next);
            if (next.length === length && value.length !== length) {
              onComplete?.(next);
            }
          }}
          className="absolute inset-0 z-10 h-full w-full cursor-text opacity-0"
        />
        <div className="flex justify-center gap-2" aria-hidden="true">
          {Array.from({ length }, (_, i) => {
            const isActive = focused && i === active && !disabled;
            return (
              <span
                key={i}
                className={cx(
                  "condensed flex h-18 min-w-0 flex-1 basis-0 max-w-16 items-center justify-center rounded-md border-2 text-code font-extrabold uppercase",
                  error
                    ? "border-danger bg-danger-soft text-danger-text"
                    : "border-line bg-surface-raised text-ink",
                  isActive &&
                    !error &&
                    "outline-3 outline-offset-2 outline-focus",
                  disabled &&
                    "border-line-subtle bg-surface-sunken text-ink-muted",
                  chars[i] && "animate-pop"
                )}
              >
                {chars[i] ??
                  (isActive ? (
                    <span className="bg-ink h-10 w-0.5 animate-pulse" />
                  ) : (
                    ""
                  ))}
              </span>
            );
          })}
        </div>
      </div>
      {error ? (
        <p
          id={`${id}-msg`}
          role="alert"
          className="text-danger-text m-0 flex items-center justify-center gap-1.5 text-sm font-bold"
        >
          <Icon name="alert" size={16} />
          {error}
        </p>
      ) : (
        <p id={`${id}-msg`} className="text-ink-muted m-0 text-center text-sm">
          {hint}
        </p>
      )}
    </div>
  );
};
