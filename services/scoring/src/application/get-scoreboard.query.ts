import type { EstimatesRepository } from "../domain/estimates.repository.ts";
import type { GamesPort } from "../domain/ports/games.port.ts";
import type { RoundsPort } from "../domain/ports/rounds.port.ts";
import type { RevealedRoundsRepository } from "../domain/revealed-rounds.repository.ts";
import { orderScoreboard, scoreRound } from "../domain/scoring-rules.ts";
import type { ScoreboardEntry } from "../domain/scoring-rules.ts";
import { NotAPlayer, RoundNotFound } from "../domain/scoring.errors.ts";

export interface ScoreboardResult {
  players: ScoreboardEntry[];
}

export class GetScoreboardQuery {
  readonly #games: GamesPort;
  readonly #rounds: RoundsPort;
  readonly #revealedRounds: RevealedRoundsRepository;
  readonly #estimates: EstimatesRepository;

  constructor(deps: {
    games: GamesPort;
    rounds: RoundsPort;
    revealedRounds: RevealedRoundsRepository;
    estimates: EstimatesRepository;
  }) {
    this.#games = deps.games;
    this.#rounds = deps.rounds;
    this.#revealedRounds = deps.revealedRounds;
    this.#estimates = deps.estimates;
  }

  async #getOrFetchSolution(
    code: string,
    roundNumber: number
  ): Promise<number | null | "not-found"> {
    const cached = await this.#revealedRounds.get(code, roundNumber);
    if (cached) {
      return cached.solution;
    }

    try {
      const round = await this.#rounds.getRound(code, roundNumber);
      if (round.solution !== null) {
        await this.#revealedRounds.save(code, {
          number: roundNumber,
          min: round.min,
          max: round.max,
          solution: round.solution,
        });
        return round.solution;
      }
      return null;
    } catch (error) {
      if (error instanceof RoundNotFound) {
        return "not-found";
      }
      throw error;
    }
  }

  async execute(
    code: string,
    askingPlayerId: string
  ): Promise<ScoreboardResult> {
    const game = await this.#games.getGame(code);

    const isPlayer = game.players.some((p) => p.id === askingPlayerId);
    if (!isPlayer) {
      throw new NotAPlayer();
    }

    const accumulatedPoints = new Map<string, number>();
    for (const player of game.players) {
      accumulatedPoints.set(player.id, 0);
    }

    for (let n = 1; ; n += 1) {
      // oxlint-disable-next-line no-await-in-loop
      const solution = await this.#getOrFetchSolution(code, n);
      if (solution === "not-found") {
        break;
      }

      if (solution !== null) {
        // oxlint-disable-next-line no-await-in-loop
        const roundEstimates = await this.#estimates.get(code, n);
        const estimatesList = roundEstimates
          ? roundEstimates.allEstimates()
          : [];
        const scored = scoreRound(solution, estimatesList);
        for (const s of scored) {
          const current = accumulatedPoints.get(s.playerId) ?? 0;
          accumulatedPoints.set(s.playerId, current + s.points);
        }
      }
    }

    const players = orderScoreboard(game.players, accumulatedPoints);
    return { players };
  }
}
