import type {
  StoredVerdict,
  VerdictsRepository,
} from "../domain/verdicts.repository.ts";

const verdictKey = (code: string, round: number): string => `${code}:${round}`;

export class MemoryVerdictsAdapter implements VerdictsRepository {
  private readonly verdicts = new Map<string, StoredVerdict>();

  get(code: string, round: number): Promise<StoredVerdict | null> {
    return Promise.resolve(this.verdicts.get(verdictKey(code, round)) ?? null);
  }

  save(code: string, round: number, verdict: StoredVerdict): Promise<void> {
    this.verdicts.set(verdictKey(code, round), verdict);
    return Promise.resolve();
  }
}
