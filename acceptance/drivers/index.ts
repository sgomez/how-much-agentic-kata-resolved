import { urlOf } from "@hmk/kit/topology";

import type { Drivers } from "../dsl/drivers.ts";
import { catalogDriver } from "./catalog.ts";
import { gamesDriver } from "./games.ts";
import { impostorDriver } from "./impostor.ts";
import { roundsDriver } from "./rounds.ts";
import { scoringDriver } from "./scoring.ts";
import { sessionDriver } from "./session.ts";

/** The system under test: the gateway at HMK_GATEWAY_URL (default http://localhost:3000). */
export const gatewayDrivers = (): Drivers => ({
  catalog: catalogDriver,
  impostor: impostorDriver,
  games: gamesDriver,
  rounds: roundsDriver,
  scoring: scoringDriver,
  session: sessionDriver(urlOf("gateway")),
});
