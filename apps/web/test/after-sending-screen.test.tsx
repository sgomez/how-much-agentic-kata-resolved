import type { GameView } from "@hmk/contracts/games";
import type { RoundViewResponse } from "@hmk/contracts/rounds";
import type { ListEstimatesResponse } from "@hmk/contracts/scoring";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  AfterSendingScreen,
  WaitingScreen,
} from "../src/features/rounds/index.ts";

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const renderWithClient = (
  ui: ReactNode,
  queryClient = createTestQueryClient()
) =>
  renderToString(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );

const mockGame: GameView = {
  code: "ABCD",
  hostId: "host-1",
  phase: "playing",
  currentRound: 1,
  players: [
    { id: "host-1", nickname: "Ana" },
    { id: "p-2", nickname: "Bob" },
  ],
  settings: {
    packs: ["geo"],
    roundSeconds: 30,
    rounds: 5,
    impostorMode: false,
  },
};

const mockRound: RoundViewResponse = {
  number: 1,
  phase: "estimating",
  question: "¿Cuántos kilómetros mide la Gran Muralla China?",
  unit: "km",
  min: 1000,
  max: 50_000,
  deadline: new Date(Date.now() + 30_000).toISOString(),
  serverNow: new Date().toISOString(),
  roundSeconds: 30,
  isImpostor: false,
  solution: null,
};

const mockScoring: ListEstimatesResponse = {
  answered: ["host-1"],
  myEstimate: 21_000,
};

describe(AfterSendingScreen, () => {
  it("exports WaitingScreen as an alias for AfterSendingScreen", () => {
    expect(WaitingScreen).toBe(AfterSendingScreen);
  });

  it("renders loading skeleton when round data is not yet loaded", () => {
    const queryClient = createTestQueryClient();
    const html = renderWithClient(
      <AfterSendingScreen gameCode="ABCD" />,
      queryClient
    );

    expect(html).toContain("ABCD");
    expect(html).toContain("animate-shimmer");
  });

  it("renders sent estimate card with formatted value and unit", () => {
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(["games", "ABCD"], mockGame);
    queryClient.setQueryData(["rounds", "ABCD", 1], mockRound);
    queryClient.setQueryData(["scoring", "ABCD", 1], mockScoring);

    const html = renderWithClient(
      <AfterSendingScreen gameCode="ABCD" />,
      queryClient
    );

    expect(html).toContain("Tu estimación");
    expect(html).toContain("21.000");
    expect(html).toContain("km");
    expect(html).toContain("Enviado");
  });

  it("renders AnswerTracker with answered count", () => {
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(["games", "ABCD"], mockGame);
    queryClient.setQueryData(["rounds", "ABCD", 1], mockRound);
    queryClient.setQueryData(["scoring", "ABCD", 1], mockScoring);

    const html = renderWithClient(
      <AfterSendingScreen gameCode="ABCD" />,
      queryClient
    );

    expect(html).toContain("1");
    expect(html).toContain("2");
    expect(html).toContain("han respondido");
  });

  it("renders PlayerList with answer status without exposing values", () => {
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(["games", "ABCD"], mockGame);
    queryClient.setQueryData(["rounds", "ABCD", 1], mockRound);
    queryClient.setQueryData(["scoring", "ABCD", 1], mockScoring);

    const html = renderWithClient(
      <AfterSendingScreen gameCode="ABCD" />,
      queryClient
    );

    expect(html).toContain("Ana");
    expect(html).toContain("Bob");
    expect(html).toContain("Ya ha respondido");
    expect(html).toContain("Pensando…");
    expect(html).not.toContain("Bob: ");
  });

  it("renders bottom action bar with Cambiar mi estimación button and hint", () => {
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(["games", "ABCD"], mockGame);
    queryClient.setQueryData(["rounds", "ABCD", 1], mockRound);
    queryClient.setQueryData(["scoring", "ABCD", 1], mockScoring);

    const html = renderWithClient(
      <AfterSendingScreen
        gameCode="ABCD"
        bottomSlot={<button type="button">Extra action</button>}
      />,
      queryClient
    );

    expect(html).toContain("Cambiar mi estimación");
    expect(html).toContain("Puedes cambiarla hasta que acabe el tiempo");
    expect(html).toContain("Extra action");
  });

  it("shows message when everyone has answered", () => {
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(["games", "ABCD"], mockGame);
    queryClient.setQueryData(["rounds", "ABCD", 1], mockRound);
    queryClient.setQueryData(["scoring", "ABCD", 1], {
      answered: ["host-1", "p-2"],
      myEstimate: 21_000,
    });

    const html = renderWithClient(
      <AfterSendingScreen gameCode="ABCD" />,
      queryClient
    );

    expect(html).toContain("¡Ya habéis respondido todos!");
  });
});
