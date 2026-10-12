import type { ContentfulStatusCode } from "hono/utils/http-status";

/**
 * Domain errors are plain `Error` subclasses declared in a service's
 * `domain/*.errors.ts`. The domain cannot import this package, so kit
 * recognises them by shape: a `kind` from this list and a `code`.
 *
 * ```ts
 * export class DeckExhausted extends Error {
 *   readonly kind = "conflict";
 *   readonly code = "deck-exhausted";
 * }
 * ```
 */
const STATUS_BY_KIND = {
  conflict: 409,
  forbidden: 403,
  invalid: 422,
  "not-found": 404,
} as const satisfies Record<string, ContentfulStatusCode>;

export type DomainErrorKind = keyof typeof STATUS_BY_KIND;

export interface DomainErrorShape extends Error {
  kind: DomainErrorKind;
  code: string;
}

export const isDomainError = (error: unknown): error is DomainErrorShape =>
  error instanceof Error &&
  "kind" in error &&
  typeof error.kind === "string" &&
  error.kind in STATUS_BY_KIND &&
  "code" in error &&
  typeof error.code === "string";

export const statusOf = (error: DomainErrorShape): ContentfulStatusCode =>
  STATUS_BY_KIND[error.kind];
