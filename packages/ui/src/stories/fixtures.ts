/** Fake data for stories and Patterns/. No API. */
export const PLAYERS = [
  { id: "p-lucia", name: "Lucía" },
  { id: "p-mario", name: "Mario" },
  { id: "p-ines", name: "Inés" },
  { id: "p-dani", name: "Dani" },
  { id: "p-sofia", name: "Sofía R." },
  { id: "p-alex", name: "Álex" },
  { id: "p-nuria", name: "Nuria" },
  { id: "p-pablo", name: "Pablo" },
  { id: "p-carmen", name: "Carmen" },
  { id: "p-jorge", name: "Jorge" },
  { id: "p-irene", name: "Irene" },
  { id: "p-hugo", name: "Hugo" },
  { id: "p-marta", name: "Marta" },
  { id: "p-leo", name: "Leo" },
  { id: "p-vera", name: "Vera" },
  { id: "p-adri", name: "Adri" },
  { id: "p-olga", name: "Olga" },
  { id: "p-raul", name: "Raúl" },
  { id: "p-eva", name: "Eva" },
  { id: "p-tomas", name: "Tomás" },
];
/** The fake player at `index`; throws when there is none, so stories never get `undefined`. */
export const player = (index: number) => {
  const found = PLAYERS[index];
  if (found === undefined) {
    throw new Error(`No fake player at ${index}`);
  }
  return found;
};
// Mario plays on this phone.
export const YOU = player(1);
// Lucía created the game.
export const HOST = player(0);
export const GAME_CODE = "KQZT";

export const QUESTIONS = {
  percent: {
    text: "¿Qué porcentaje de la superficie de la Tierra es agua?",
    unit: "%",
    min: 0,
    max: 100,
    step: 1,
    solution: 71,
  },
  everest: {
    text: "¿Cuántos metros mide el Everest?",
    unit: "m",
    min: 0,
    max: 8848,
    step: 1,
    solution: 8848,
  },
  iceland: {
    text: "¿Cuántas personas viven en Islandia?",
    unit: "personas",
    min: 1,
    max: 1_000_000_000,
    step: 1,
    solution: 383_000,
  },
  coldest: {
    text: "¿Cuál es la temperatura más baja registrada en la Tierra?",
    unit: "°C",
    min: -90,
    max: 60,
    step: 0.5,
    solution: -89.2,
  },
  wall: {
    text: "¿Cuántos kilómetros mide la Gran Muralla China?",
    unit: "km",
    min: 0,
    max: 50_000,
    step: 1,
    solution: 21_196,
  },
  density: {
    text: "¿Cuál es la densidad de población de Mónaco?",
    unit: "habitantes por km²",
    min: 0,
    max: 50_000,
    step: 1,
    solution: 18_300,
  },
} as const;

/** Server timestamps for a deadline `secondsLeft` from now. */
export const deadline = (secondsLeft: number) => {
  const now = Date.now();
  return { serverNow: now, endsAt: now + secondsLeft * 1000 };
};

/** Scattered estimates for Iceland (log), around 383.000. */
export const ICELAND_ESTIMATES: [string, number | null][] = [
  ["p-lucia", 350_000],
  ["p-mario", 1_200_000],
  ["p-ines", 400_000],
  ["p-dani", 90_000],
  ["p-sofia", 380_000],
  ["p-alex", 2_000_000],
  ["p-nuria", 500_000],
  ["p-pablo", 300_000],
  ["p-carmen", 410_000],
  ["p-jorge", 5_000_000],
  ["p-irene", 380_000],
  ["p-hugo", 250_000],
  ["p-marta", null],
  ["p-leo", 600_000],
  ["p-vera", 330_000],
  ["p-adri", 1_000_000],
  ["p-olga", 420_000],
  ["p-raul", 700_000],
  ["p-eva", 395_000],
  ["p-tomas", 150_000],
];
export const byId = (id: string) => {
  const found = PLAYERS.find((p) => p.id === id);
  if (found === undefined) {
    throw new Error(`No fake player with id ${id}`);
  }
  return found;
};

/** The first fake players, one per score, with that score: `withScores([7, 4])`. */
export const withScores = (scores: readonly number[]) =>
  scores.map((score, index) => ({ ...player(index), score }));

/** Does nothing: for handlers a story does not need. */
export const noop = () => null;
