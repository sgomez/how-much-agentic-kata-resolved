import { JWT_AUDIENCE, JWT_ISSUER } from "@hmk/auth";
import { betterAuth } from "better-auth";
import { memoryAdapter } from "better-auth/adapters/memory";
import { anonymous, jwt } from "better-auth/plugins";

/** What the gateway uses from Better Auth. */
export interface Auth {
  handler: (request: Request) => Promise<Response>;
  api: {
    /** Mints a JWT for the session in `headers`; rejects without a session. */
    getToken: (input: { headers: Headers }) => Promise<{ token: string }>;
  };
}

export interface AuthOptions {
  /** Signs cookies. Random per boot unless BETTER_AUTH_SECRET is set. */
  secret: string;
  /** Extra hosts the app is reached through, besides localhost and ngrok. */
  extraHosts?: readonly string[];
}

/**
 * Players sign in anonymously and then set their nickname as the user's name.
 * Everything lives in memory: restarting the gateway signs everyone out.
 * The JWT plugin mints the tokens services verify against /api/auth/jwks.
 */
export const createAuth = ({ secret, extraHosts = [] }: AuthOptions): Auth =>
  betterAuth({
    secret,
    baseURL: {
      // The browser reaches the gateway through Vite (dev), directly, or through ngrok.
      allowedHosts: [
        "localhost:*",
        "127.0.0.1:*",
        "*.ngrok-free.app",
        "*.ngrok-free.dev",
        "*.ngrok.app",
        "*.ngrok.dev",
        "*.ngrok.io",
        ...extraHosts,
      ],
      fallback: "http://localhost:3000",
    },
    advanced: { trustedProxyHeaders: true },
    database: memoryAdapter({
      account: [],
      jwks: [],
      session: [],
      user: [],
      verification: [],
    }),
    // Twenty players and the acceptance tests share a few IP addresses.
    rateLimit: { enabled: false },
    plugins: [
      anonymous(),
      jwt({
        jwks: { keyPairConfig: { alg: "EdDSA" } },
        jwt: {
          audience: JWT_AUDIENCE,
          definePayload: ({ user }) => ({ name: user.name }),
          expirationTime: "15m",
          issuer: JWT_ISSUER,
        },
      }),
    ],
  });
