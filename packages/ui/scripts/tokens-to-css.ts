// Generates src/styles/tokens.css (the Tailwind 4 @theme block) from design/tokens.json.
// tokens.json is the source of truth: edit it, then run `pnpm --filter @hmk/ui tokens`.
// A unit test fails when tokens.css and tokens.json drift apart.
import { readFileSync, writeFileSync } from "node:fs";

type Themed = string | Record<string, string>;

interface Token {
  name: string;
  value: Themed;
}

interface TypeStyle {
  name: string;
  fontSize: string;
  lineHeight: string;
  letterSpacing?: string;
}

export interface Tokens {
  name: string;
  color: { themes: { id: string }[]; tokens: Token[] };
  shadow: { tokens: Token[] };
  type: {
    families: Record<string, string>;
    groups: { styles: TypeStyle[] }[];
  };
  spacing: { tokens: Token[] };
  radius: { tokens: Token[] };
  easing: { tokens: Token[] };
  container: { tokens: Token[] };
  borderWidth: { tokens: Token[] };
  duration: { tokens: Token[] };
  zIndex: { tokens: Token[] };
}

const TOKENS_JSON = new URL("../design/tokens.json", import.meta.url);
const TOKENS_CSS = new URL("../src/styles/tokens.css", import.meta.url);

const valueIn = (token: Token, theme: string, fallback: string): string =>
  typeof token.value === "string"
    ? token.value
    : (token.value[theme] ?? token.value[fallback] ?? "");

/** A reference such as "{color-ink}" becomes "var(--color-ink)". */
const resolve = (value: string): string =>
  value.replace(/^\{(?<name>.+)\}$/u, "var(--$<name>)");

const declaration = (name: string, value: string): string =>
  `  --${name}: ${value};`;

/** The contents of tokens.css for the given tokens. */
export const renderTokensCss = (tokens: Tokens): string => {
  const [first = "light", ...others] = tokens.color.themes.map(({ id }) => id);
  const themeVars: string[] = [];
  const plainVars: string[] = [];
  const darkVars: string[] = [];

  for (const token of tokens.color.tokens) {
    themeVars.push(
      declaration(token.name, resolve(valueIn(token, first, first)))
    );
    for (const theme of others) {
      const value =
        typeof token.value === "object" ? token.value[theme] : undefined;
      if (value !== undefined && value !== valueIn(token, first, first)) {
        darkVars.push(declaration(token.name, resolve(value)));
      }
    }
  }
  for (const token of tokens.shadow.tokens) {
    themeVars.push(declaration(token.name, valueIn(token, first, first)));
    for (const theme of others) {
      const value =
        typeof token.value === "object" ? token.value[theme] : undefined;
      if (value !== undefined) {
        darkVars.push(declaration(token.name, value));
      }
    }
  }
  for (const [family, stack] of Object.entries(tokens.type.families)) {
    themeVars.push(declaration(`font-${family}`, stack));
  }
  for (const style of tokens.type.groups.flatMap(({ styles }) => styles)) {
    themeVars.push(
      declaration(`text-${style.name}`, style.fontSize),
      declaration(`text-${style.name}--line-height`, style.lineHeight)
    );
    if (style.letterSpacing !== undefined) {
      themeVars.push(
        declaration(`text-${style.name}--letter-spacing`, style.letterSpacing)
      );
    }
  }
  for (const group of [
    tokens.spacing,
    tokens.radius,
    tokens.easing,
    tokens.container,
  ]) {
    for (const token of group.tokens) {
      themeVars.push(declaration(token.name, valueIn(token, first, first)));
    }
  }
  for (const group of [tokens.borderWidth, tokens.duration, tokens.zIndex]) {
    for (const token of group.tokens) {
      plainVars.push(declaration(token.name, valueIn(token, first, first)));
    }
  }

  return `/* ${tokens.name}: generated from design/tokens.json. Do not edit: run \`pnpm --filter @hmk/ui tokens\`. */

/* Only this system's tokens exist: Tailwind's default palette, fonts and type scale are cleared,
   so bg-surface / text-ink / text-estimate are the only way to say those things. */
@theme static {
  --color-*: initial;
  --font-*: initial;
  --text-*: initial;
  --shadow-*: initial;
  --radius-*: initial;
  --ease-*: initial;
${themeVars.join("\n")}
}

:root {
${plainVars.join("\n")}
  color-scheme: light;
}

/* Dark theme: same token names, new values. Follows the phone's setting unless
   data-theme="light" | "dark" is set on <html>. */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
${darkVars.map((line) => `  ${line}`).join("\n")}
    color-scheme: dark;
  }
}
:root[data-theme="dark"] {
${darkVars.join("\n")}
  color-scheme: dark;
}
`;
};

export const readTokens = (): Tokens =>
  JSON.parse(readFileSync(TOKENS_JSON, "utf-8")) as Tokens;

export const readTokensCss = (): string => readFileSync(TOKENS_CSS, "utf-8");

if (import.meta.main) {
  writeFileSync(TOKENS_CSS, renderTokensCss(readTokens()));
  console.log("Wrote src/styles/tokens.css");
}
