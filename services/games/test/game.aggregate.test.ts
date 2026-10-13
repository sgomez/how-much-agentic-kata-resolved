import { describe, expect, it } from "vitest";

import { Game } from "../src/domain/game.aggregate.ts";
import type { Player, Settings } from "../src/domain/game.aggregate.ts";
import {
  GameAlreadyStartedError,
  NicknameTakenError,
  NotEnoughPlayersError,
  NotTheHostError,
  WrongRoundError,
} from "../src/domain/game.errors.ts";

const ana: Player = { id: "u1", nickname: "Ana" };
const ben: Player = { id: "u2", nickname: "Ben" };
const eva: Player = { id: "u3", nickname: "Eva" };
const settings: Settings = {
  impostorMode: false,
  packs: [],
  roundSeconds: 30,
  rounds: 2,
};

const playing = (currentRound = 1) =>
  Game.restore({
    code: "KQZT",
    currentRound,
    host: ana,
    phase: "playing",
    players: [ana, ben],
    settings,
  });

describe("joining", () => {
  it("adds players at the end of the line", () => {
    const game = Game.create("KQZT", ana, settings);

    game.join(ben);
    game.join(eva);

    expect(game.players).toStrictEqual([ana, ben, eva]);
  });

  it("rejects a nickname another player has, ignoring case and spaces", () => {
    const game = Game.create("KQZT", ana, settings);

    expect(() => game.join({ id: "u9", nickname: "  aNA " })).toThrow(
      NicknameTakenError
    );
  });

  it("leaves a player already in alone, even after the game started", () => {
    const game = playing();

    game.join(ben);

    expect(game.players).toStrictEqual([ana, ben]);
  });

  it("rejects a new player once the game started", () => {
    expect(() => playing().join(eva)).toThrow(GameAlreadyStartedError);
  });
});

describe("starting", () => {
  it("needs two players, or three in impostor mode", () => {
    const alone = Game.create("KQZT", ana, settings);
    expect(() => alone.start("u1")).toThrow(NotEnoughPlayersError);

    const impostor = Game.create("KQZT", ana, {
      ...settings,
      impostorMode: true,
    });
    impostor.join(ben);
    expect(() => impostor.start("u1")).toThrow(NotEnoughPlayersError);
    impostor.join(eva);
    impostor.start("u1");
    expect(impostor.phase).toBe("playing");
  });

  it("is for the host only, and plays round 1", () => {
    const game = Game.create("KQZT", ana, settings);
    game.join(ben);

    expect(() => game.start("u2")).toThrow(NotTheHostError);
    game.start("u1");

    expect(game.currentRound).toBe(1);
  });
});

describe("moving on", () => {
  it("plays the next round once it was created", () => {
    const game = playing(1);

    game.moveOn(1, true);

    expect(game.currentRound).toBe(2);
    expect(game.phase).toBe("playing");
  });

  it("finishes after the last round, whatever rounds created", () => {
    const game = playing(2);

    game.moveOn(2, true);

    expect(game.phase).toBe("finished");
    expect(game.currentRound).toBe(2);
  });

  it("finishes when no round was created: the deck is exhausted", () => {
    const game = playing(1);

    game.moveOn(1, false);

    expect(game.phase).toBe("finished");
  });

  it("changes nothing when the game already moved on from the round", () => {
    const game = playing(2);

    game.moveOn(1, true);

    expect(game.currentRound).toBe(2);
    expect(game.canMoveOn("u1", 1)).toBeFalsy();
  });

  it("is for the host only, and not for rounds ahead", () => {
    const game = playing(1);

    expect(() => game.canMoveOn("u2", 1)).toThrow(NotTheHostError);
    expect(() => game.canMoveOn("u1", 2)).toThrow(WrongRoundError);
  });
});
