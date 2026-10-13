import type { RoundViewResponse } from "@hmk/contracts/rounds";

import type { ClockPort } from "../domain/ports/clock.port.ts";
import { RoundNotFoundError } from "../domain/round.errors.ts";
import type { RoundRepository } from "../domain/round.repository.ts";

export interface GetRoundViewInput {
  gameCode: string;
  roundNumber: number;
  playerId: string;
}

export class GetRoundView {
  readonly #rounds: RoundRepository;
  readonly #clock: ClockPort;

  constructor(deps: { rounds: RoundRepository; clock: ClockPort }) {
    this.#rounds = deps.rounds;
    this.#clock = deps.clock;
  }

  async execute(input: GetRoundViewInput): Promise<RoundViewResponse> {
    const round = await this.#rounds.findByGameAndNumber(
      input.gameCode,
      input.roundNumber
    );

    if (!round || !round.isComplete()) {
      throw new RoundNotFoundError(input.gameCode, input.roundNumber);
    }

    const now = this.#clock.now();
    return round.viewFor(input.playerId, now);
  }
}
