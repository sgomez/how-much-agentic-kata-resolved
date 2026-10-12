/** Player identity helpers: stable colour from id, initials, distinct display names. */

export const PLAYER_COLOR_COUNT = 12;

/** Players whose colour needs white initials; the rest use ink. Keep in sync with tokens.json. */
const WHITE_INK = new Set([2, 3, 6, 9, 11]);

/** FNV-1a hash → 1..12. The same id always gets the same colour, on every phone. */
// oxlint-disable no-bitwise -- a 32-bit hash is bit arithmetic by definition.
export const playerColorIndex = (id: string): number => {
  let h = 0x81_1c_9d_c5;
  for (let i = 0; i < id.length; i += 1) {
    h ^= id.codePointAt(i) ?? 0;
    h = Math.imul(h, 0x01_00_01_93);
  }
  // final avalanche (murmur3 fmix32) so similar ids ("p-1", "p-2") still spread over all colours
  h ^= h >>> 16;
  h = Math.imul(h, 0x85_eb_ca_6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2_b2_ae_35);
  h ^= h >>> 16;
  return ((h >>> 0) % PLAYER_COLOR_COUNT) + 1;
};
// oxlint-enable no-bitwise

export const playerColorVar = (id: string): string =>
  `var(--color-player-${playerColorIndex(id)})`;

export const playerInkVar = (id: string): string =>
  WHITE_INK.has(playerColorIndex(id)) ? "#ffffff" : "#1d1a15";

/** "Lucía Pérez" → "LP" · "lu" → "LU" · "Óscar" → "ÓS" · "🦊 Zorro" → "ZO". */
export const initials = (name: string): string => {
  const words = name
    .trim()
    .split(/\s+/u)
    .map((w) => w.replaceAll(/[^\p{L}\p{N}]/gu, ""))
    .filter(Boolean);
  if (words.length === 0) {
    return "?";
  }
  const [first = "", second] = words;
  if (second === undefined) {
    return first.slice(0, 2).toLocaleUpperCase("es-ES");
  }
  return `${first.slice(0, 1)}${second.slice(0, 1)}`.toLocaleUpperCase("es-ES");
};

/**
 * When the game allows repeated nicknames, call this once on the player list:
 * the second "Ana" becomes "Ana 2", the third "Ana 3" (in join order). Colours already differ by id.
 */
export const withDistinctNames = <T extends { name: string }>(
  players: T[]
): T[] => {
  const seen = new Map<string, number>();
  return players.map((p) => {
    const key = p.name.trim().toLocaleLowerCase("es-ES");
    const n = (seen.get(key) ?? 0) + 1;
    seen.set(key, n);
    return n === 1 ? p : { ...p, name: `${p.name} ${n}` };
  });
};

/** Standard competition ranking: ties share a position (1, 1, 3). Input is sorted by score desc. */
export const competitionRanks = (scores: number[]): number[] => {
  const ranks: number[] = [];
  for (const [index, score] of scores.entries()) {
    const previousRank = ranks.at(-1);
    const tiesPrevious = index > 0 && scores[index - 1] === score;
    ranks.push(
      tiesPrevious && previousRank !== undefined ? previousRank : index + 1
    );
  }
  return ranks;
};
