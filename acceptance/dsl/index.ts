// The acceptance DSL: games described the way players experience them.
// Rule: only what a player sees on screen or does with their phone belongs here.
// How services split the work never appears (there is no `round.close()`).

import { randomUUID } from "node:crypto";

import { gatewayDrivers } from "../drivers/index.ts";
import type { Drivers, JoinOutcome, Player, RoundView } from "./drivers.ts";
import { waitFor } from "./wait.ts";

export type { RoundView } from "./drivers.ts";
export { PendingContractError } from "./pending-contract.ts";

/** Short rounds keep the suite fast; the deadline still decides the reveal. */
const ROUND_SECONDS = 3;
const REVEAL_MARGIN_MS = 5000;
const MS_PER_SECOND = 1000;
const DIAL_MAX = 1000;

const drivers: Drivers = gatewayDrivers();

/** Unique per run, so nicknames and questions never clash with earlier runs. */
const runTag = (): string => randomUUID().slice(0, 6);

const syntheticQuestion = (solution: number) => {
  const tag = runTag();
  return {
    id: `acceptance-${tag}`,
    text: `Synthetic question ${tag}`,
    unit: "units",
    solution,
    pack: "acceptance",
    min: 0,
    max: Math.max(DIAL_MAX, solution * 2),
  };
};

/** Signs in a player who is not in any game yet. */
export const newPlayer = (alias: string): Promise<Player> =>
  drivers.session.signIn(alias, `${alias}-${runTag()}`);

/** Question packs, as a signed-in player sees them. */
export const packsSeenBy = (player: Player): Promise<string[]> =>
  drivers.catalog.packs(player);

export interface NewGameOptions {
  /** Aliases; the first one is the host. */
  players: [string, ...string[]];
  /** Solution of the first question. */
  solution: number;
  impostor?: boolean;
}

export interface Game {
  code: string;
  /** Each listed player sends an estimate. */
  estimate: (estimates: Record<string, number>) => Promise<void>;
  /** Waits until every player sees the round revealed. */
  waitForReveal: () => Promise<void>;
  /** The game moves on to a new question with this solution; waits until everyone sees it. */
  nextRound: (options: { solution: number }) => Promise<void>;
  /** Points per alias, as the host's scoreboard shows them. */
  scoreboard: () => Promise<Record<string, number>>;
  /** What this player's round screen shows now (like reopening the app). */
  viewOf: (alias: string) => Promise<RoundView>;
  /** The one player whose screen does not show the question. */
  whoIsTheImpostor: () => Promise<string>;
  /** The game moves on to the vote, then each listed player votes for a suspect (by alias). */
  vote: (votes: Record<string, string>) => Promise<void>;
  /** Waits until every player sees the vote as finished. */
  waitForVotingToEnd: () => Promise<void>;
}

const playerNamed = (players: Map<string, Player>, alias: string): Player => {
  const player = players.get(alias);
  if (player === undefined) {
    throw new Error(`No player called "${alias}" in this game`);
  }
  return player;
};

/** Signs everyone in, the host creates the game, the others join, and the host starts. */
export const newGame = async ({
  players: aliases,
  solution,
  impostor = false,
}: NewGameOptions): Promise<Game> => {
  const players = new Map<string, Player>();
  for (const alias of aliases) {
    // oxlint-disable-next-line no-await-in-loop -- one phone at a time, like people arriving.
    players.set(alias, await newPlayer(alias));
  }
  const all = [...players.values()];
  const [host, ...guests] = all;
  if (host === undefined) {
    throw new Error("A game needs at least one player");
  }

  await drivers.catalog.rigNextQuestion(host, syntheticQuestion(solution));
  const { code } = await drivers.games.createGame(host, {
    impostor,
    roundSeconds: ROUND_SECONDS,
  });
  for (const guest of guests) {
    // oxlint-disable-next-line no-await-in-loop
    const outcome = await drivers.games.join(guest, code);
    if (outcome !== "joined") {
      throw new Error(`${guest.alias} could not join game ${code}: ${outcome}`);
    }
  }
  await drivers.games.startGame(host, code);

  const roundOf = async (player: Player): Promise<RoundView | undefined> =>
    (await drivers.rounds.currentRound(player, code)) ?? undefined;

  const everyoneSees = (
    description: string,
    seen: (view: RoundView) => boolean,
    timeoutMs?: number
  ) =>
    waitFor(
      description,
      async () => {
        const views = await Promise.all(all.map(roundOf));
        return views.every((view) => view !== undefined && seen(view))
          ? true
          : undefined;
      },
      timeoutMs
    );

  let roundNumber = 1;
  await everyoneSees(
    "every player sees the first round",
    (view) => view.number === roundNumber
  );

  const game: Game = {
    code,
    estimate: async (estimates) => {
      await Promise.all(
        Object.entries(estimates).map(([alias, value]) =>
          drivers.scoring.estimate(playerNamed(players, alias), code, value)
        )
      );
    },
    nextRound: async ({ solution: next }) => {
      await drivers.catalog.rigNextQuestion(host, syntheticQuestion(next));
      await drivers.games.nextRound(host, code);
      roundNumber += 1;
      await everyoneSees(
        `every player sees round ${roundNumber}`,
        (view) => view.number === roundNumber
      );
    },
    scoreboard: async () => {
      const lines = await drivers.scoring.scoreboard(host, code);
      const aliasOf = new Map(
        all.map((player) => [player.nickname, player.alias])
      );
      return Object.fromEntries(
        lines.map((line) => [
          aliasOf.get(line.nickname) ?? line.nickname,
          line.points,
        ])
      );
    },
    viewOf: async (alias) => {
      const view = await drivers.rounds.currentRound(
        playerNamed(players, alias),
        code
      );
      if (view === null) {
        throw new Error(`${alias} sees no round`);
      }
      return view;
    },
    vote: async (votes) => {
      await drivers.impostor.openVoting(host, code);
      await Promise.all(
        Object.entries(votes).map(([alias, suspect]) =>
          drivers.impostor.vote(
            playerNamed(players, alias),
            code,
            playerNamed(players, suspect).nickname
          )
        )
      );
    },
    waitForReveal: async () => {
      await everyoneSees(
        `every player sees round ${roundNumber} revealed`,
        (view) => view.number === roundNumber && view.phase === "revealed",
        ROUND_SECONDS * MS_PER_SECOND + REVEAL_MARGIN_MS
      );
    },
    waitForVotingToEnd: async () => {
      await waitFor("every player sees the vote finished", async () => {
        const over = await Promise.all(
          all.map((player) => drivers.impostor.votingIsOver(player, code))
        );
        return over.every(Boolean) ? true : undefined;
      });
    },
    whoIsTheImpostor: async () => {
      const views = await Promise.all(
        all.map(async (player) => ({
          alias: player.alias,
          view: await roundOf(player),
        }))
      );
      const blind = views
        .filter(({ view }) => view?.question === null)
        .map(({ alias }) => alias);
      const [onlyOne, ...others] = blind;
      if (onlyOne === undefined || others.length > 0) {
        throw new Error(
          `Expected exactly one player without the question, got: [${blind.join(", ")}]`
        );
      }
      return onlyOne;
    },
  };
  return game;
};

/** A player tries to join a game by typing a code. */
export const tryToJoin = async (
  alias: string,
  code: string
): Promise<JoinOutcome> => drivers.games.join(await newPlayer(alias), code);

/** The host creates a game and the guests join; nobody starts yet. Returns the lobby each one sees. */
export const openLobby = async (aliases: [string, ...string[]]) => {
  const players = await Promise.all(aliases.map(newPlayer));
  const [host, ...guests] = players;
  if (host === undefined) {
    throw new Error("A game needs a host");
  }
  const { code } = await drivers.games.createGame(host, {
    impostor: false,
    roundSeconds: ROUND_SECONDS,
  });
  for (const guest of guests) {
    // oxlint-disable-next-line no-await-in-loop
    await drivers.games.join(guest, code);
  }
  return {
    code,
    nicknames: players.map((player) => player.nickname),
    lobbySeenBy: (index: number) => {
      const player = players[index];
      if (player === undefined) {
        throw new Error(`No player #${index}`);
      }
      return drivers.games.lobby(player, code);
    },
  };
};
