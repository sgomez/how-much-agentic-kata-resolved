import { startService } from "@hmk/kit";
import { PORTS } from "@hmk/kit/topology";

import { composeGamesFromEnv } from "./composition.ts";

startService(composeGamesFromEnv(process.env), "games", PORTS.games);
