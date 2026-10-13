import type { EstimatesRepository } from "../domain/estimates.repository.ts";
import type { GamesPort } from "../domain/ports/games.port.ts";
import type { RoundsPort } from "../domain/ports/rounds.port.ts";
import type { RevealedRoundsRepository } from "../domain/revealed-rounds.repository.ts";
import { scoreRound } from "../domain/scoring-rules.ts";
import { NotAPlayer, RoundNotRevealed } from "../domain/scoring.errors.ts";

export interface RevealEstimateEntry {
  id: string;
  nickname: string;
  value: number;
  distance: number;
  points: number;
}

export interface RevealResult {
  solution: number;
  estimates: RevealEstimateEntry[];
}

export class GetRevealQuery {
  readonly #games: GamesPort;
  readonly #rounds: RoundsPort;
  readonly #estimates: EstimatesRepository;
  readonly #revealedRounds: RevealedRoundsRepository;

  constructor(deps: {
    games: GamesPort;
    rounds: RoundsPort;
    estimates: EstimatesRepository;
    revealedRounds: RevealedRoundsRepository;
  }) {
    this.#games = deps.games;
    this.#rounds = deps.rounds;
    this.#estimates = deps.estimates;
    this.#revealedRounds = deps.revealedRounds;
  }

  async execute(input: {
    code: string;
    round: number;
    askingPlayerId: string;
  }): Promise<RevealResult> {
    const round = await this.#rounds.getRound(input.code, input.round);
    if (round.solution === null) {
      throw new RoundNotRevealed(input.round);
    }

    const game = await this.#games.getGame(input.code);
    const isPlayer = game.players.some((p) => p.id === input.askingPlayerId);
    if (!isPlayer) {
      throw new NotAPlayer();
    }

    await this.#revealedRounds.save(input.code, {
      max: round.max,
      min: round.min,
      number: input.round,
      solution: round.solution,
    });

    const roundEstimates = await this.#estimates.get(input.code, input.round);
    const estimatesList = roundEstimates ? roundEstimates.allEstimates() : [];
    const scored = scoreRound(round.solution, estimatesList);

    const nicknames = new Map(game.players.map((p) => [p.id, p.nickname]));

    const estimates: RevealEstimateEntry[] = scored
      .map((s) => ({
        distance: s.distance,
        id: s.playerId,
        nickname: nicknames.get(s.playerId) ?? s.playerId,
        points: s.points,
        value: s.value,
      }))
      .toSorted((a, b) => a.distance - b.distance);

    return {
      estimates,
      solution: round.solution,
    };
  }
}
