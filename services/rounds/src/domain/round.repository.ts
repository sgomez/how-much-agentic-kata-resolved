import type { Round } from "./round.aggregate.ts";

export interface RoundRepository {
  findByGameAndNumber: (
    gameCode: string,
    roundNumber: number
  ) => Promise<Round | null>;
  findLastByGame: (gameCode: string) => Promise<Round | null>;
  save: (round: Round) => Promise<void>;
}
