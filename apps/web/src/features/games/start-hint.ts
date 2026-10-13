/**
 * Why the host cannot start yet, or null when they can: two players are needed,
 * three in impostor mode (the same rule as `POST /api/games/:code/start`).
 */
export const startHint = ({
  players,
  impostorMode,
}: {
  players: number;
  impostorMode: boolean;
}): string | null => {
  const minimum = impostorMode ? 3 : 2;
  return players >= minimum
    ? null
    : `Hacen falta al menos ${minimum} jugadores (sois ${players})`;
};
