import type { GameView } from "@hmk/contracts/games";
import type { VotingView } from "@hmk/contracts/impostor";
import type { RoundViewResponse } from "@hmk/contracts/rounds";
import { Button, BottomActionBar, EmptyState, Screen, Toast } from "@hmk/ui";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useParams } from "react-router";

import { api, ApiError } from "../../shell/api.ts";
import { authClient } from "../../shell/auth-client.ts";
import { useView } from "../../shell/use-view.ts";
import { chooseScene } from "./scene-director.ts";
import type { SceneAction } from "./scene-director.ts";
import { SceneScreenView } from "./scene-screens.tsx";
import { startHint } from "./start-hint.ts";

const actionLabels: Record<SceneAction, string> = {
  start: "Empezar",
  "open-voting": "Abrir votación",
  "view-scoreboard": "Ver clasificación",
  "next-round": "Siguiente ronda",
};

const errorMessages: Record<string, string> = {
  "voting-not-over": "La votación aún no ha terminado",
  "round-not-revealed": "La ronda aún no se ha revelado",
  "not-enough-players": "Faltan jugadores para empezar",
  "deck-exhausted": "No quedan preguntas para empezar la partida",
  "game-already-started": "La partida ya ha empezado",
  "not-the-host": "Solo quien creó la partida puede empezarla",
  "wrong-round": "La partida ya ha avanzado",
};

/** A 404 means "not there yet": the phone shows the loading screen. */
const orNotFound = async <T,>(read: () => Promise<T>): Promise<T | null> => {
  try {
    return await read();
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
};

const useGameViews = (code: string) => {
  const { data: game, error: gameError } = useView(["game", code], () =>
    api<GameView>(`/games/${code}`)
  );
  const round = game?.phase === "lobby" ? null : game?.currentRound;
  const impostorMode = game?.settings.impostorMode ?? false;

  const { data: roundView } = useView(["round", code, round], () =>
    round === null || round === undefined
      ? Promise.resolve(null)
      : orNotFound(() => api<RoundViewResponse>(`/rounds/${code}/${round}`))
  );
  const roundPhase = roundView?.phase ?? null;
  const votingWanted =
    impostorMode &&
    game?.phase === "playing" &&
    roundPhase === "revealed" &&
    round !== null &&
    round !== undefined;
  const { data: votingView } = useView(
    ["voting", code, round, votingWanted],
    () =>
      votingWanted
        ? orNotFound(() => api<VotingView>(`/impostor/${code}/${round}`))
        : Promise.resolve(null)
  );

  return {
    game,
    gameError,
    roundPhase,
    votingStatus: votingView?.voting ?? null,
  };
};

/** `/games/:code`: polls the views and shows the screen that matches the moment of the game. */
export const GamePage = () => {
  const { code = "" } = useParams();
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();
  const [seenRound, setSeenRound] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const { game, gameError, roundPhase, votingStatus } = useGameViews(code);

  if (gameError instanceof ApiError && gameError.code === "unknown-code") {
    return (
      <Screen centered>
        <EmptyState
          icon="alert"
          tone="danger"
          title="Esa partida no existe"
          description="Revisa el código."
        />
      </Screen>
    );
  }
  if (game === undefined) {
    return <SceneScreenView screen="loading" code={code} />;
  }

  const scene = chooseScene({
    gamePhase: game.phase,
    impostorMode: game.settings.impostorMode,
    isHost: session?.user.id === game.hostId,
    roundPhase,
    votingStatus,
    scoreboardSeen: seenRound !== null && seenRound === game.currentRound,
  });

  const run = async (action: SceneAction) => {
    if (action === "view-scoreboard") {
      setSeenRound(game.currentRound);
      return;
    }
    // A double tap must not send the action twice.
    if (busy) {
      return;
    }
    setBusy(true);
    try {
      if (action === "start") {
        await api(`/games/${code}/start`, { method: "POST" });
      } else if (action === "open-voting") {
        // Until impostor exports its "Abrir votación" action.
        await api(`/impostor/${code}/${game.currentRound}/voting`, {
          method: "POST",
        });
      } else {
        await api(`/games/${code}/next`, {
          body: { round: game.currentRound },
        });
      }
      await queryClient.invalidateQueries({ queryKey: ["game", code] });
    } catch (error) {
      setToast(
        error instanceof ApiError
          ? (errorMessages[error.code] ??
              "Algo ha fallado. Inténtalo de nuevo.")
          : "Algo ha fallado. Inténtalo de nuevo."
      );
    }
    setBusy(false);
  };

  const { action } = scene;
  const hint =
    action === "start"
      ? startHint({
          impostorMode: game.settings.impostorMode,
          players: game.players.length,
        })
      : null;
  const bottom =
    action === null ? undefined : (
      <BottomActionBar hint={hint}>
        <Button
          size="lg"
          fullWidth
          disabled={hint !== null || busy}
          onClick={() => run(action)}
        >
          {actionLabels[action]}
        </Button>
      </BottomActionBar>
    );

  return (
    <>
      <SceneScreenView screen={scene.screen} code={code} bottom={bottom} />
      <Toast
        open={toast !== null}
        message={toast ?? ""}
        tone="danger"
        onClose={() => setToast(null)}
      />
    </>
  );
};
