import type { VerdictResult } from "./scoring-rules.ts";

export interface StoredVerdict {
  verdict: VerdictResult;
  impostorId: string;
}

export interface VerdictsRepository {
  readonly get: (code: string, round: number) => Promise<StoredVerdict | null>;
  readonly save: (
    code: string,
    round: number,
    verdict: StoredVerdict
  ) => Promise<void>;
}
