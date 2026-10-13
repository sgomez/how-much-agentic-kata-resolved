import type { RoundVoting } from "../domain/voting.aggregate.ts";
import { RoundNotFoundError } from "../domain/voting.errors.ts";
import type { VotingRepository } from "../domain/voting.repository.ts";

/** The voting of a round, or `RoundNotFoundError` when the round has none. */
export const findVoting = async (
  votings: VotingRepository,
  gameCode: string,
  round: number
): Promise<RoundVoting> => {
  const voting = await votings.get(gameCode, round);
  if (voting === undefined) {
    throw new RoundNotFoundError(gameCode, round);
  }
  return voting;
};
