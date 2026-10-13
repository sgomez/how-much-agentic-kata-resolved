import { Button, Stack, Text } from "@hmk/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "../../shell/api.ts";
import { authClient } from "../../shell/auth-client.ts";
import { errorMessage } from "./errors.ts";
import { useGame, useVoting } from "./use-impostor-round.ts";

/**
 * Host-only "Abrir votación" button for the host's bar while the voting is pending.
 * Renders nothing for other players or once the voting has left `pending`.
 */
export const OpenVotingButton = ({ gameCode }: { gameCode: string }) => {
  const { data: session } = authClient.useSession();
  const { data: game } = useGame(gameCode);
  const round = game?.currentRound;
  const { data: voting } = useVoting(gameCode, round);
  const queryClient = useQueryClient();
  const open = useMutation({
    mutationFn: () =>
      api(`/impostor/${gameCode}/${round}/voting`, { method: "POST" }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["impostor", gameCode] }),
  });
  if (
    game === undefined ||
    session?.user.id !== game.hostId ||
    voting?.voting !== "pending"
  ) {
    return null;
  }
  return (
    <Stack gap={2}>
      {open.isError ? (
        <Text tone="danger" size="sm">
          {errorMessage(open.error)}
        </Text>
      ) : null}
      <Button
        size="lg"
        fullWidth
        icon="vote"
        disabled={open.isPending}
        onClick={() => open.mutate()}
      >
        Abrir votación
      </Button>
    </Stack>
  );
};
