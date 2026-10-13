import type { RoundEstimates } from "./round-estimates.aggregate.ts";

export interface EstimatesRepository {
  get: (code: string, round: number) => Promise<RoundEstimates | undefined>;
  save: (estimates: RoundEstimates) => Promise<void>;
}
