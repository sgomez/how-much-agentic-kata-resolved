import { ApiError } from "../../shell/api.ts";

const FALLBACK = "Algo ha fallado. Inténtalo otra vez.";

const MESSAGES: Record<string, string> = {
  "already-voted": "Ya has votado. Tu voto es definitivo.",
  "voting-not-open": "La votación no está abierta.",
  "self-vote": "No puedes votarte a ti mismo.",
  "unknown-suspect": "Ese jugador no está en la ronda.",
  "round-not-revealed":
    "Aún no se ha revelado la ronda. Inténtalo de nuevo en un momento.",
  "voting-over": "La votación ya ha terminado.",
  "not-the-host": "Solo el anfitrión puede hacer esto.",
  "not-a-player": "No participas en esta ronda.",
};

/** Spanish text for an error answer of the impostor service. */
export const errorMessage = (error: unknown): string =>
  error instanceof ApiError ? (MESSAGES[error.code] ?? FALLBACK) : FALLBACK;
