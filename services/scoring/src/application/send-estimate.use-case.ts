import type { EstimatesRepository } from "../domain/estimates.repository.ts";
import type { RoundsPort } from "../domain/ports/rounds.port.ts";
import { RoundEstimates } from "../domain/round-estimates.aggregate.ts";

export interface SendEstimateInput {
  code: string;
  round: number;
  playerId: string;
  value: number;
}

/** Sends or replaces a player's estimate for a round. */
export class SendEstimate {
  readonly #estimates: EstimatesRepository;
  readonly #rounds: RoundsPort;

  constructor(deps: { estimates: EstimatesRepository; rounds: RoundsPort }) {
    this.#estimates = deps.estimates;
    this.#rounds = deps.rounds;
  }

  async execute({
    code,
    round,
    playerId,
    value,
  }: SendEstimateInput): Promise<number> {
    const roundDetails = await this.#rounds.getRound(code, round);
    const roundEstimates =
      (await this.#estimates.get(code, round)) ??
      RoundEstimates.start(code, round);

    const stored = roundEstimates.record({
      playerId,
      value,
      min: roundDetails.min,
      max: roundDetails.max,
      solution: roundDetails.solution,
    });

    await this.#estimates.save(roundEstimates);
    return stored;
  }
}
