import { startService } from "@hmk/kit";
import { PORTS } from "@hmk/kit/topology";

import { composeScoringFromEnv } from "./composition.ts";

startService(composeScoringFromEnv(process.env), "scoring", PORTS.scoring);
