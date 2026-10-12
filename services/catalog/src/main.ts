import { startService } from "@hmk/kit";
import { PORTS } from "@hmk/kit/topology";

import { composeCatalogFromEnv } from "./composition.ts";

startService(composeCatalogFromEnv(process.env), "catalog", PORTS.catalog);
