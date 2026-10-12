/** Every process of the system and the port it listens on. One source of truth. */
export const PORTS = {
  gateway: 3000,
  catalog: 3001,
  games: 3002,
  rounds: 3003,
  scoring: 3004,
  impostor: 3005,
  web: 5173,
} as const;

export type ProcessName = keyof typeof PORTS;
export type ServiceName = Exclude<ProcessName, "gateway" | "web">;

export const SERVICE_NAMES: readonly ServiceName[] = [
  "catalog",
  "games",
  "rounds",
  "scoring",
  "impostor",
];

/** Base URL of a process. Override with `HMK_<NAME>_URL`, e.g. `HMK_CATALOG_URL`. */
export const urlOf = (name: ProcessName): string =>
  process.env[`HMK_${name.toUpperCase()}_URL`] ??
  `http://localhost:${PORTS[name]}`;

/** Where services fetch the gateway's public keys to verify tokens. */
export const jwksUrl = (): string => `${urlOf("gateway")}/api/auth/jwks`;
