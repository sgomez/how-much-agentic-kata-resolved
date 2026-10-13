import type { RoundPlayer } from "@hmk/contracts/rounds";

import type { CatalogPort } from "../domain/ports/catalog.port.ts";
import type { ClockPort } from "../domain/ports/clock.port.ts";
import { Round } from "../domain/round.aggregate.ts";
import { WrongRoundNumberError } from "../domain/round.errors.ts";
import type { RoundRepository } from "../domain/round.repository.ts";

export interface CreateRoundInput {
  gameCode: string;
  roundNumber: number;
  players: readonly RoundPlayer[];
  hostId: string;
  packs?: readonly string[] | undefined;
  roundSeconds: number;
  impostorMode: boolean;
}

export interface CreateRoundOutput {
  number: number;
  alreadyExisted: boolean;
}

export class CreateRound {
  readonly #rounds: RoundRepository;
  readonly #catalog: CatalogPort;
  readonly #clock: ClockPort;

  constructor(deps: {
    rounds: RoundRepository;
    catalog: CatalogPort;
    clock: ClockPort;
  }) {
    this.#rounds = deps.rounds;
    this.#catalog = deps.catalog;
    this.#clock = deps.clock;
  }

  async execute(input: CreateRoundInput): Promise<CreateRoundOutput> {
    const existing = await this.#rounds.findByGameAndNumber(
      input.gameCode,
      input.roundNumber
    );

    if (existing && existing.isComplete()) {
      return { alreadyExisted: true, number: input.roundNumber };
    }

    const lastRound = await this.#rounds.findLastByGame(input.gameCode);
    const expectedNumber = lastRound ? lastRound.number + 1 : 1;
    if (input.roundNumber !== expectedNumber) {
      throw new WrongRoundNumberError(expectedNumber, input.roundNumber);
    }

    const question = await this.#catalog.drawQuestion(
      input.gameCode,
      input.packs
    );

    const now = this.#clock.now();
    const round = Round.create({
      gameCode: input.gameCode,
      hostId: input.hostId,
      impostorMode: input.impostorMode,
      now,
      number: input.roundNumber,
      players: input.players,
      question,
      roundSeconds: input.roundSeconds,
    });

    await this.#rounds.save(round);

    return { alreadyExisted: false, number: input.roundNumber };
  }
}
