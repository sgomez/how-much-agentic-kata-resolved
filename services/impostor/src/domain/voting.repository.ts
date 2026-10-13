import type { RoundVoting } from "./voting.aggregate.ts";

export interface VotingRepository {
  get: (gameCode: string, round: number) => Promise<RoundVoting | undefined>;
  save: (voting: RoundVoting) => Promise<void>;
}
