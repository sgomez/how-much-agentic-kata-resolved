import { startService } from "@hmk/kit";
import { PORTS } from "@hmk/kit/topology";

import { composeImpostorFromEnv } from "./composition.ts";

startService(composeImpostorFromEnv(process.env), "impostor", PORTS.impostor);
