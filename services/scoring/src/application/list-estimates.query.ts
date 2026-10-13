import type { EstimatesRepository } from "../domain/estimates.repository.ts";

export interface ListEstimatesInput {
  code: string;
  round: number;
  playerId: string;
}

export interface ListEstimatesResult {
  answered: string[];
  myEstimate: number | null;
}

/** Lists who has answered the round, and the asking player's own estimate. */
export class ListEstimates {
  readonly #estimates: EstimatesRepository;

  constructor(deps: { estimates: EstimatesRepository }) {
    this.#estimates = deps.estimates;
  }

  async execute({
    code,
    round,
    playerId,
  }: ListEstimatesInput): Promise<ListEstimatesResult> {
    const roundEstimates = await this.#estimates.get(code, round);
    if (!roundEstimates) {
      return {
        answered: [],
        myEstimate: null,
      };
    }

    return {
      answered: roundEstimates.answeredPlayers(),
      myEstimate: roundEstimates.getEstimate(playerId),
    };
  }
}
