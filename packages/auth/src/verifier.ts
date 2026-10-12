import { createRemoteJWKSet, jwtVerify } from "jose";
import type { JWTVerifyGetKey } from "jose";

/** Issuer and audience the gateway puts in every token it mints. */
export const JWT_ISSUER = "hmk-gateway";
export const JWT_AUDIENCE = "hmk-services";

/** The authenticated player, as every service sees it. */
export interface AuthUser {
  id: string;
  name: string;
}

export interface TokenVerifier {
  /** Resolves with the token's user, or rejects if the token is not valid. */
  verify: (token: string) => Promise<AuthUser>;
}

/** Verifies tokens with a jose key set (`createRemoteJWKSet` or `createLocalJWKSet`). */
export const createKeyVerifier = (keys: JWTVerifyGetKey): TokenVerifier => ({
  async verify(token) {
    const { payload } = await jwtVerify(token, keys, {
      audience: JWT_AUDIENCE,
      issuer: JWT_ISSUER,
    });
    if (typeof payload.sub !== "string" || typeof payload.name !== "string") {
      throw new TypeError("token has no sub or name claim");
    }
    return { id: payload.sub, name: payload.name };
  },
});

/**
 * Verifies tokens against the gateway's public keys. Keys are fetched once and
 * cached; an unknown key id triggers a refetch, so a gateway restart is fine.
 */
export const createJwksVerifier = (jwksUrl: string): TokenVerifier =>
  createKeyVerifier(createRemoteJWKSet(new URL(jwksUrl)));

/**
 * For tests: accepts exactly the given tokens, each mapped to its user.
 * `app.request("/x", { headers: { authorization: "Bearer ana" } })`
 */
export const createStaticVerifier = (
  users: Readonly<Record<string, AuthUser>>
): TokenVerifier => ({
  verify(token) {
    const user = users[token];
    return user === undefined
      ? Promise.reject(new Error("unknown token"))
      : Promise.resolve(user);
  },
});
