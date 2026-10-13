import type {
  ImpostorPort,
  RoundVerdict,
} from "../domain/ports/impostor.port.ts";

export class MemoryImpostorAdapter implements ImpostorPort {
  private readonly verdicts = new Map<string, RoundVerdict>();
  private readonly errors = new Map<string, Error>();

  setVerdict(code: string, round: number, verdict: RoundVerdict): void {
    this.verdicts.set(`${code}:${round}`, verdict);
  }

  setError(code: string, round: number, error: Error): void {
    this.errors.set(`${code}:${round}`, error);
  }

  getVerdict(code: string, round: number): Promise<RoundVerdict> {
    const error = this.errors.get(`${code}:${round}`);
    if (error) {
      return Promise.reject(error);
    }
    const verdict = this.verdicts.get(`${code}:${round}`);
    if (!verdict) {
      return Promise.reject(new Error(`No verdict for round ${round}`));
    }
    return Promise.resolve(verdict);
  }
}
