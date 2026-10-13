import type { Candidate } from "@hmk/contracts/impostor";

/** The impostor service, as rounds needs it. */
export interface ImpostorPort {
  /**
   * Asks Impostor to choose an impostor for the round.
   * Returns the chosen impostor's id.
   */
  chooseImpostor: (
    gameCode: string,
    roundNumber: number,
    candidates: readonly Candidate[],
    hostId: string,
    deadline: Date
  ) => Promise<string>;
}
