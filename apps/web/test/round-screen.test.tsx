import type { GameView } from "@hmk/contracts/games";
import type { RoundViewResponse } from "@hmk/contracts/rounds";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { RoundScreen } from "../src/features/rounds/index.ts";

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

describe(RoundScreen, () => {
  it("renders loading state when currentRound is null or round is not found", () => {
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(["games", "ABCD"], {
      ...mockGame,
      phase: "lobby",
      currentRound: null,
    });

    const html = renderWithClient(<RoundScreen gameCode="ABCD" />, queryClient);

    expect(html).toContain("ABCD");
    expect(html).toContain("animate-shimmer");
  });

  it("renders loading state when game view is missing or loading", () => {
    const queryClient = createTestQueryClient();
    const html = renderWithClient(<RoundScreen gameCode="WXYZ" />, queryClient);

    expect(html).toContain("WXYZ");
    expect(html).toContain("animate-shimmer");
  });

  it("renders top bar with round info and countdown timer", () => {
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(["games", "ABCD"], mockGame);
    queryClient.setQueryData(["rounds", "ABCD", 1], mockRound);

    const html = renderWithClient(<RoundScreen gameCode="ABCD" />, queryClient);

    expect(html).toContain("ABCD");
    expect(html).toContain("Ronda");
    expect(html).toContain(">1<");
    expect(html).toContain("> / <!-- -->5<");
    expect(html).toContain('role="timer"');
  });

  it("renders question card, ruler and bottom action bar with optional slot", () => {
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(["games", "ABCD"], mockGame);
    queryClient.setQueryData(["rounds", "ABCD", 1], mockRound);

    const html = renderWithClient(
      <RoundScreen
        gameCode="ABCD"
        bottomSlot={<button type="button">Siguiente ronda</button>}
      />,
      queryClient
    );

    expect(html).toContain("¿Cuántos kilómetros mide la Gran Muralla China?");
    expect(html).toContain("km");
    expect(html).toContain('role="slider"');
    expect(html).toContain("Enviar");
    expect(html).toContain("Siguiente ronda");
  });

  it("renders impostor view without question text", () => {
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(["games", "ABCD"], {
      ...mockGame,
      settings: { ...mockGame.settings, impostorMode: true },
    });
    queryClient.setQueryData(["rounds", "ABCD", 1], {
      ...mockRound,
      question: null,
      isImpostor: true,
    });

    const html = renderWithClient(<RoundScreen gameCode="ABCD" />, queryClient);

    expect(html).toContain("Eres el impostor. Disimula.");
    expect(html).toContain("km");
    expect(html).not.toContain("¿Cuántos kilómetros mide");
    expect(html).toContain('role="slider"');
  });

  it("renders AnswerTracker in bottom action bar using scoring estimates", () => {
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(["games", "ABCD"], mockGame);
    queryClient.setQueryData(["rounds", "ABCD", 1], mockRound);
    queryClient.setQueryData(["scoring", "ABCD", 1], {
      answered: ["host-1"],
      myEstimate: null,
    });

    const html = renderWithClient(<RoundScreen gameCode="ABCD" />, queryClient);

    expect(html).toContain("1");
    expect(html).toContain("2");
    expect(html).toContain("han respondido");
  });

  it("renders disabled Cambiar button when estimate was already sent", () => {
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(["games", "ABCD"], mockGame);
    queryClient.setQueryData(["rounds", "ABCD", 1], mockRound);
    queryClient.setQueryData(["scoring", "ABCD", 1], {
      answered: ["host-1"],
      myEstimate: 21_000,
    });

    const html = renderWithClient(<RoundScreen gameCode="ABCD" />, queryClient);

    expect(html).toContain("Cambiar");
    expect(html).not.toContain("Enviar");
    expect(html).toContain("disabled");
  });

  it("disables ruler and shows time-up hint when deadline has passed", () => {
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(["games", "ABCD"], mockGame);
    queryClient.setQueryData(["rounds", "ABCD", 1], {
      ...mockRound,
      phase: "revealed",
      solution: 21_196,
    });

    const html = renderWithClient(<RoundScreen gameCode="ABCD" />, queryClient);

    expect(html).toContain('aria-disabled="true"');
    expect(html).toContain("Se acabó el tiempo");
    expect(html).toContain("disabled");
  });
});
