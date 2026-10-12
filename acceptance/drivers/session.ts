import type { SessionDriver } from "../dsl/drivers.ts";
import { gatewayHttp } from "./gateway-http.ts";

/** Signs in through Better Auth in the gateway, exactly as the web app does. */
export const sessionDriver = (baseUrl: string): SessionDriver => ({
  signIn: async (alias, nickname) => {
    const authPost = async (path: string, body: unknown, cookie = "") => {
      try {
        return await fetch(`${baseUrl}/api/auth${path}`, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            cookie,
            origin: baseUrl,
          },
          body: JSON.stringify(body),
        });
      } catch (error) {
        throw new Error(
          `Cannot reach the gateway at ${baseUrl}. Start the system with \`pnpm dev\` in another terminal, then run \`pnpm acceptance\` again.`,
          { cause: error }
        );
      }
    };

    const signIn = await authPost("/sign-in/anonymous", {});
    if (!signIn.ok) {
      throw new Error(
        `Anonymous sign-in failed with ${signIn.status}. Is \`pnpm dev\` running?`
      );
    }
    const cookie = signIn.headers
      .getSetCookie()
      .map((header) => header.split(";")[0])
      .join("; ");

    const update = await authPost("/update-user", { name: nickname }, cookie);
    if (!update.ok) {
      throw new Error(`Setting the nickname failed with ${update.status}`);
    }
    return { alias, http: gatewayHttp(baseUrl, cookie), nickname };
  },
});
