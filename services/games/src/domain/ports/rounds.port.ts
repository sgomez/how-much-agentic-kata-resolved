import type { CreateRoundRequest } from "@hmk/contracts/rounds";

/** The rounds service, as games needs it. */
export interface RoundsPort {
  /**
   * Asks rounds to create round `number` of a game. Asking again for a round
   * that exists is harmless.
   * @throws {DeckExhaustedError} when no question is left for the round.
   * Any other failure of rounds is thrown as it comes.
   */
  createRound: (
    code: string,
    number: number,
    request: CreateRoundRequest
  ) => Promise<void>;
}
