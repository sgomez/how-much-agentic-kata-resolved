import { anonymousClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

/** Talks to Better Auth in the gateway, on this same origin (/api/auth). */
export const authClient = createAuthClient({ plugins: [anonymousClient()] });

/** Signs the player in anonymously (once per browser) and sets their nickname. */
export const signInWithNickname = async (nickname: string): Promise<void> => {
  const session = await authClient.getSession();
  if (session.data === null) {
    const { error } = await authClient.signIn.anonymous();
    if (error !== null) {
      throw new Error(error.message ?? "anonymous sign-in failed");
    }
  }
  const { error } = await authClient.updateUser({ name: nickname });
  if (error !== null) {
    throw new Error(error.message ?? "could not set the nickname");
  }
};
