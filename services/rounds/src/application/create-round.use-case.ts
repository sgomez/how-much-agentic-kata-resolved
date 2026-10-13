import type { RoundPlayer } from "@hmk/contracts/rounds";

import type { CatalogPort } from "../domain/ports/catalog.port.ts";
import type { ClockPort } from "../domain/ports/clock.port.ts";
import type { ImpostorPort } from "../domain/ports/impostor.port.ts";
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
  readonly #impostor?: ImpostorPort;

  constructor(deps: {
    rounds: RoundRepository;
    catalog: CatalogPort;
    clock: ClockPort;
    impostor?: ImpostorPort;
  }) {
    this.#rounds = deps.rounds;
    this.#catalog = deps.catalog;
    this.#clock = deps.clock;
    this.#impostor = deps.impostor;
  }

  async execute(input: CreateRoundInput): Promise<CreateRoundOutput> {
    const existing = await this.#rounds.findByGameAndNumber(
      input.gameCode,
      input.roundNumber
    );

    if (existing && existing.isComplete()) {
      return { alreadyExisted: true, number: input.roundNumber };
    }

    if (existing && !existing.isComplete()) {
      if (!this.#impostor) {
        throw new Error("Impostor port is required in impostor mode");
      }
      const impostorId = await this.#impostor.chooseImpostor(
        input.gameCode,
        input.roundNumber,
        input.players,
        input.hostId,
        existing.deadline
      );
      const completed = existing.complete(impostorId);
      await this.#rounds.save(completed);
      return { alreadyExisted: false, number: input.roundNumber };
    }

    const lastRound = await this.#rounds.findLastByGame(input.gameCode);
    let expectedNumber = 1;
    if (lastRound) {
      expectedNumber = lastRound.isComplete()
        ? lastRound.number + 1
        : lastRound.number;
    }
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

    if (input.impostorMode) {
      if (!this.#impostor) {
        throw new Error("Impostor port is required in impostor mode");
      }
      // Step 2: Reserve round with question and deadline
      await this.#rounds.save(round);

      // Step 3: Ask Impostor
      const impostorId = await this.#impostor.chooseImpostor(
        input.gameCode,
        input.roundNumber,
        input.players,
        input.hostId,
        round.deadline
      );

      // Step 4: Complete round
      const completed = round.complete(impostorId);
      await this.#rounds.save(completed);
      return { alreadyExisted: false, number: input.roundNumber };
    }

    await this.#rounds.save(round);

    return { alreadyExisted: false, number: input.roundNumber };
  }
}
