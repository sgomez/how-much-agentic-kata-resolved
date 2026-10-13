/**
 * Scoring rules: points of a round, of a verdict, and scoreboard order.
 * Pure domain module (ADR-0002).
 * Domain vocabulary follows GLOSSARY.md:
 * Estimate, Distance, Closest, Exact hit, Scoreboard, Catching bonus.
 */

export interface PlayerEstimate {
  playerId: string;
  value: number;
}

export interface ScoredEstimate {
  playerId: string;
  value: number;
  distance: number;
  points: number;
}

export interface PlayerSummary {
  id: string;
  nickname: string;
}

export interface ScoreboardEntry {
  id: string;
  nickname: string;
  points: number;
}

export type VerdictResult = "escaped" | "caught";

/**
 * Given a revealed round's solution and player estimates:
 * - distance: absolute difference Math.abs(value - solution), no rounding.
 * - closest: 3 points (tied at same distance each get 3 points).
 * - exact hit: estimate equals solution, +2 points (so 5 points total for exact hit if closest).
 * - everyone else: 0 points.
 * - cases to handle: nobody answered, one single estimate, ties, negative numbers, decimals with no rounding.
 */
export const scoreRound = (
  solution: number,
  estimates: readonly PlayerEstimate[]
): ScoredEstimate[] => {
  if (estimates.length === 0) {
    return [];
  }

  const withDistances = estimates.map((e) => ({
    playerId: e.playerId,
    value: e.value,
    distance: Math.abs(e.value - solution),
  }));

  const minDistance = Math.min(...withDistances.map((e) => e.distance));

  return withDistances.map((e) => {
    let points = 0;
    if (e.distance === minDistance) {
      // Closest scores 3 points
      points += 3;
    }
    if (e.value === solution) {
      // Exact hit adds 2 points
      points += 2;
    }
    return {
      playerId: e.playerId,
      value: e.value,
      distance: e.distance,
      points,
    };
  });
};

/**
 * Given a verdict:
 * - escaped: 5 points for the impostor, 0 for everyone else.
 * - caught: 0 for the impostor, catching bonus of 2 points for every other player of the game
 *   (whoever they voted for or didn't vote).
 */
export const scoreVerdict = (
  verdict: VerdictResult,
  impostorId: string,
  gamePlayerIds: readonly string[]
): Record<string, number> => {
  const result: Record<string, number> = {};

  for (const playerId of gamePlayerIds) {
    if (playerId === impostorId) {
      result[playerId] = verdict === "escaped" ? 5 : 0;
    } else {
      result[playerId] = verdict === "caught" ? 2 : 0;
    }
  }

  return result;
};

/**
 * Given a player list (in joining order) and their accumulated points:
 * - sorts points descending;
 * - players tied on points keep their joining order;
 * - players without points appear with 0.
 */
export const orderScoreboard = (
  players: readonly PlayerSummary[],
  accumulatedPoints:
    | ReadonlyMap<string, number>
    | Readonly<Record<string, number>>
): ScoreboardEntry[] => {
  const getPoints = (id: string): number => {
    if (accumulatedPoints instanceof Map) {
      return accumulatedPoints.get(id) ?? 0;
    }
    const record = accumulatedPoints as Readonly<Record<string, number>>;
    return record[id] ?? 0;
  };

  const scoreboard: ScoreboardEntry[] = players.map((p) => ({
    id: p.id,
    nickname: p.nickname,
    points: getPoints(p.id),
  }));

  return scoreboard.toSorted((a, b) => b.points - a.points);
};
