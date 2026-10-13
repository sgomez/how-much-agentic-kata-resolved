import type { VerdictResult } from "../scoring-rules.ts";

export interface RoundVerdict {
  verdict: VerdictResult | null;
  impostorId: string | null;
}

export interface ImpostorPort {
  readonly getVerdict: (code: string, round: number) => Promise<RoundVerdict>;
}
