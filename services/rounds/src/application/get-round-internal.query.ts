import type { RoundInternalResponse } from "@hmk/contracts/rounds";

import type { ClockPort } from "../domain/ports/clock.port.ts";
import { RoundNotFoundError } from "../domain/round.errors.ts";
import type { RoundRepository } from "../domain/round.repository.ts";

export interface GetRoundInternalInput {
  gameCode: string;
  roundNumber: number;
  playerId: string;
}

export class GetRoundInternal {
  readonly #rounds: RoundRepository;
  readonly #clock: ClockPort;

  constructor(deps: { rounds: RoundRepository; clock: ClockPort }) {
    this.#rounds = deps.rounds;
    this.#clock = deps.clock;
  }

  async execute(input: GetRoundInternalInput): Promise<RoundInternalResponse> {
    const round = await this.#rounds.findByGameAndNumber(
      input.gameCode,
      input.roundNumber
    );

    if (!round || !round.isComplete()) {
      throw new RoundNotFoundError(input.gameCode, input.roundNumber);
    }

    const now = this.#clock.now();
    return round.internalViewFor(input.playerId, now);
  }
}
