import type { EstimatesRepository } from "../domain/estimates.repository.ts";
import type { RoundEstimates } from "../domain/round-estimates.aggregate.ts";

export class MemoryEstimatesRepository implements EstimatesRepository {
  readonly #estimates = new Map<string, RoundEstimates>();

  get(code: string, round: number): Promise<RoundEstimates | undefined> {
    return Promise.resolve(this.#estimates.get(`${code}:${round}`));
  }

  save(estimates: RoundEstimates): Promise<void> {
    this.#estimates.set(`${estimates.code}:${estimates.round}`, estimates);
    return Promise.resolve();
  }
}
