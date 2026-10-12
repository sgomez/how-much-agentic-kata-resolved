---
status: accepted
---

# A light hexagon per service, with machine-checked rules

Four groups implement one service each, in parallel and with agents, in a monorepo. Each agent starts every ticket with a clean context and only knows where a file goes if the structure tells it. Left to each agent, the shape of a service would come out four different ways, and the final integration could not take it. So **every service is a light hexagon with four layers and a composition root**, and `dependency-cruiser` checks the dependency rules on every `pnpm check`, instead of human review. The catalog ships finished as the **reference service**: the solved example agents imitate.

```
services/<service>/
├─ GLOSSARY.md                 vocabulary of the service (linked from GLOSSARY-MAP.md)
├─ src/
│  ├─ composition.ts           composition root: the only file that sees every layer
│  ├─ main.ts                  starts the HTTP server with what composition.ts returns
│  ├─ domain/                  aggregate, entities, errors, pure rules
│  │  ├─ <aggregate>.aggregate.ts
│  │  ├─ <aggregate>.repository.ts     interface of the aggregate's repository
│  │  ├─ <name>.errors.ts
│  │  └─ ports/                ports to the outside: other services, clock, randomness
│  ├─ application/             use cases (writes) and queries (reads)
│  ├─ infra/                   adapters: in-memory and HTTP to other services
│  └─ http/                    Hono routes; validate with the schemas in @hmk/contracts
└─ test/                       use case tests with in-memory adapters, route tests
```

## Dependency rules

All are checked by `dependency-cruiser` (`.dependency-cruiser.cjs`). If one fails, `pnpm check` fails, and the message says how to fix it.

1. **Isolated services.** A service imports nothing from another service. It talks to it through a port whose adapter uses HTTP and the schemas in `@hmk/contracts`.
2. **Pure domain.** `domain/` imports neither `application/`, `infra/`, `http/` nor the composition root. Outside the service it may only import from `@hmk/contracts`. It imports no npm package (not `hono`, not `better-auth`, not `zod` directly) and no `node:` module.
3. **Application without details.** `application/` imports `domain/` and nothing else from the service.
4. **Thin HTTP.** `http/` imports `application/` and `@hmk/contracts`. It does not import `domain/` directly (except `*.errors.ts`) nor `infra/`.
5. **Invisible infra.** Only `composition.ts` imports `infra/` (tests in `test/` may too).
6. **No cycles**, anywhere.
7. **Limited shared packages.** Services may import `@hmk/contracts`, `@hmk/auth` and `@hmk/kit`, and never `@hmk/ui` or `apps/`.
8. **Isolated screens.** In `apps/web`, `src/features/<group>/` imports another feature only through its `index.ts`, where that group exports the screens it agreed to share. Everything else is shared through `src/shell/` and `@hmk/ui`.

## Shape rules (convention; `/code-review` watches them)

- **Single writer.** The protected state of an aggregate only changes through the aggregate's methods. The canonical use case is: load from the repository → ask other services through their ports if needed → call the aggregate → save to the repository → return. A use case cannot leave an invalid state by forgetting a step: whatever can be forgotten belongs in the aggregate.
- **Ports go in use case signatures**, never in aggregate signatures. The aggregate does not talk to other services: it receives the data it needs as arguments (the catalog's `Deck.draw(pool, roll)` receives a random number, not the `Random` port).
- **Randomness and time are ports.** `Clock` and `Random` are injected so that tests of rounds and impostor are deterministic.
- **A port is created when it has two adapters**: the real one and the in-memory one for tests. A port with a single adapter is a hypothetical seam and is not added.
- **No `shared/` folder.** What two services use goes into a package with its own name, or gets duplicated.
- **Domain errors** extend `Error` and declare a `kind` (`invalid`, `not-found`, `conflict`, `forbidden`) and a `code`; `@hmk/kit` turns them into HTTP answers without the domain importing it (see `services/catalog/src/domain/deck.errors.ts`).

## Suffix vocabulary

The file name declares its structural role. Suffixes are technical vocabulary; the rest of the name is the ubiquitous language of the service's `GLOSSARY.md`. Both are English (ADR-0004).

| Suffix | Rule |
| --- | --- |
| `.aggregate.ts` | aggregate root, with protected transitions |
| `.repository.ts` | persistence interface of the aggregate, declared in `domain/` |
| `.port.ts` | port to something outside the service |
| `.adapter.ts` | implementation of a port or a repository, in `infra/` |
| `.use-case.ts` | a write with a single public method |
| `.query.ts` | a read with a single public method |
| `.routes.ts` | Hono routes of one part of the service |
| `.errors.ts` | domain errors |
| _(no suffix)_ | pure domain modules (rules, calculations); their folder already explains them |

Examples: `domain/deck.aggregate.ts`, `domain/ports/catalog.port.ts`, `infra/catalog-http.adapter.ts`, `application/draw-question.use-case.ts`, `domain/packs.ts`.

## In-memory state

Game services keep their state in memory, behind their `.repository.ts`. A game lasts minutes and nobody looks at it afterwards, so a database adds nothing to the kata and adds one more piece to start on twenty laptops. If persistence is ever needed, another adapter is added to the same repository without touching the domain. Even Better Auth in the gateway uses its in-memory adapter: there is no database at all.

## Considered Options

- **Free shape, policed in review.** Rejected: with twenty people and two hours no review keeps up. Besides, the agent learns a rule by hitting it in `pnpm check`, not by reading a document.
- **NestJS with its modules as the hexagon.** Rejected for now: decorators and dependency injection hide the composition root, Vitest needs `unplugin-swc`, and each feature asks for a module, a controller and provider tokens. The `dependency-cruiser` rules already give the structure Nest would bring.
- **Full hexagon** (CQRS with command buses, separate read model, domain events with their own infrastructure). Rejected: ceremony that does not fit in two hours.
- **Layers by type at the monorepo root** (one `domain/` shared by everyone). Rejected: it breaks the isolation between groups, which is the reason for the microservices (ADR-0001).

## Consequences

- The catalog service and the four skeletons are born with this shape; the catalog carries use cases, a query, ports with both adapters, and their tests.
- Communication between services and with phones is by queries and polling (ADR-0003).
- `pnpm check` is the agent's feedback loop: format, lint, types, architecture and tests in one command. `AGENTS.md` requires it before a ticket is closed.
- A dependency rule that gets in the way during the kata is not switched off on the spot. It is noted for `/retro`.
