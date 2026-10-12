---
status: accepted
---

# One microservice per group

Four groups build the game in parallel during a two-hour kata, so the system is split into one service per group (`games`, `rounds`, `scoring`, `impostor`), each with its own screens, plus a prefabricated `gateway` and `catalog`. The reason is mainly didactic, and we say so plainly: separate services let four groups work at the same time without stepping on each other, and they force the groups to negotiate HTTP contracts, which is one of the skills the kata exercises. On technical merit alone, a game of this size would be a modular monolith.

## Considered Options

- **Modular monolith with one module per group.** The better production choice here: one process, in-process calls, no network failures. Rejected because module boundaries are easy to cross under time pressure, and contract negotiation would shrink to sharing TypeScript types.
- **Horizontal teams (backend, frontend, design system).** Rejected: no group could finish a feature on its own, and integration would happen in the last minutes.

## Consequences

- Each group owns a vertical slice: its service, its contract in `packages/contracts/src/<group>/`, its screens in `apps/web/src/features/<group>/` and its acceptance driver (see `.github/CODEOWNERS`).
- Every laptop runs seven processes (`pnpm dev`): the gateway, five services and Vite. No Docker and no native modules, so it stays light.
- Services only talk over HTTP, through ports and with Zod contracts (ADR-0002, ADR-0003). The gateway is the single door for browsers and verifies identity once; services verify the JWT it forwards.
