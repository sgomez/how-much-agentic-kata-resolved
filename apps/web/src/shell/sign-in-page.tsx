import {
  BottomActionBar,
  Button,
  Heading,
  Input,
  Screen,
  Stack,
  Text,
} from "@hmk/ui";
import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router";

import { authClient, signInWithNickname } from "./auth-client.ts";

const MAX_NICKNAME_LENGTH = 16;
const FORM_ID = "sign-in";

/** Only allow going back to a page of this app. */
const safeNext = (next: string | null): string =>
  next?.startsWith("/") === true && !next.startsWith("//") ? next : "/";

export const SignInPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { refetch } = authClient.useSession();
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = nickname.trim();
    if (name === "") {
      setError("Escribe un apodo para que los demás te reconozcan");
      return;
    }
    setPending(true);
    setError(undefined);
    try {
      await signInWithNickname(name);
      await refetch();
      await navigate(safeNext(params.get("next")), { replace: true });
    } catch {
      setError("No hemos podido entrar. Inténtalo de nuevo.");
      setPending(false);
    }
  };

  return (
    <Screen
      centered
      bottom={
        <BottomActionBar>
          <Button
            type="submit"
            form={FORM_ID}
            size="lg"
            fullWidth
            icon="arrow-right"
            disabled={nickname.trim() === ""}
            loading={pending}
          >
            Entrar
          </Button>
        </BottomActionBar>
      }
    >
      <form id={FORM_ID} onSubmit={submit}>
        <Stack gap={6}>
          <Stack gap={2}>
            <Heading level={1} size="display">
              ¿Cómo te llamamos?
            </Heading>
            <Text tone="muted">Sin registros: con un apodo basta.</Text>
          </Stack>
          <Input
            label="Tu apodo"
            name="nickname"
            autoComplete="nickname"
            hint="Así te verán los demás"
            placeholder="p. ej. Lucía"
            maxLength={MAX_NICKNAME_LENGTH}
            value={nickname}
            onChange={setNickname}
            error={error}
          />
        </Stack>
      </form>
    </Screen>
  );
};
