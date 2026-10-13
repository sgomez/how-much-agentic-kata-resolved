import { describe, expect, it } from "vitest";

import { startHint } from "./start-hint.ts";

describe(startHint, () => {
  it.each([
    {
      expected: "Hacen falta al menos 2 jugadores (sois 1)",
      impostorMode: false,
      players: 1,
    },
    {
      expected: "Hacen falta al menos 3 jugadores (sois 2)",
      impostorMode: true,
      players: 2,
    },
  ])(
    "explains why the host cannot start with $players player(s), impostor $impostorMode",
    ({ players, impostorMode, expected }) => {
      expect(startHint({ impostorMode, players })).toBe(expected);
    }
  );

  it.each([
    { impostorMode: false, players: 2 },
    { impostorMode: true, players: 3 },
  ])(
    "has nothing to say with $players players, impostor $impostorMode",
    (input) => {
      expect(startHint(input)).toBeNull();
    }
  );
});
