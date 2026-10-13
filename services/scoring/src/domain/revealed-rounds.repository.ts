export interface RevealedRound {
  number: number;
  min: number;
  max: number;
  solution: number;
}

export interface RevealedRoundsRepository {
  readonly get: (code: string, round: number) => Promise<RevealedRound | null>;
  readonly save: (code: string, revealed: RevealedRound) => Promise<void>;
}
