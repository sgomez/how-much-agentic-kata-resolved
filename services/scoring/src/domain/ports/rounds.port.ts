export interface RoundDetails {
  number: number;
  deadline: string;
  min: number;
  max: number;
  solution: number | null;
}

export interface RoundsPort {
  getRound: (code: string, round: number) => Promise<RoundDetails>;
}
