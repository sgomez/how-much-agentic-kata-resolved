import { startService } from "@hmk/kit";
import { PORTS } from "@hmk/kit/topology";

import { composeRoundsFromEnv } from "./composition.ts";

startService(composeRoundsFromEnv(process.env), "rounds", PORTS.rounds);
