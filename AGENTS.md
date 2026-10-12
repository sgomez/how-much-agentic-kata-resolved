# AGENTS.md

How Much Agentic Kata: an online clone of the party game "Cuánto Crees", built in two hours by four groups. Each group owns one vertical slice: a service, its HTTP contract, its screens and its acceptance driver (`.github/CODEOWNERS`). `README.md` has the layout and the scripts.

## Language

Converse with the user in their language. Everything that goes into the repo or GitHub is English: code, comments, test names, commits, issues, specs, tickets, PRs, ADRs, glossary entries, contract schemas. The one exception is user-facing text in `apps/web`, written in Spanish from Spain (ADR-0004).

## Done means `pnpm check` is green

Run `pnpm check` before declaring anything done: format, lint, types, architecture and unit tests in one go. `pnpm fix` formats and applies lint fixes. An architecture violation prints how to fix it; follow that fix rather than editing `.dependency-cruiser.cjs`. Commits follow Conventional Commits (`feat(games): ...`).

## Ownership

Change only your group's folders: `services/<group>/`, `packages/contracts/src/<group>/`, `apps/web/src/features/<group>/`, `acceptance/drivers/<group>.ts`. Anything shared (`packages/*`, `apps/web/src/shell/`, `acceptance/dsl/`, root config, `docs/`) changes through a PR the other groups review.

## Building a service

Before creating a file in a service, find its counterpart in `services/catalog` (the reference implementation) and copy its shape: layer, suffix, constructor style, tests. ADR-0002 explains the shape; ADR-0003 explains why services and phones only poll and never push.

## Building screens

In `apps/web`, build screens only with `@hmk/ui` components; `packages/ui/COMPONENTS.md` indexes them and says which ones each screen needs. The `Patterns/` stories show every screen put together, with each open product rule drawn in all its variants: the group picks one (`packages/ui/docs/open-decisions.md`). Fetch a screen's view with `useView` and send actions with `api` (both in `apps/web/src/shell/`). UI strings are Spanish (Spain).

## Vocabulary

Domain words come from each service's `GLOSSARY.md`, listed in `GLOSSARY-MAP.md`. Shared game words are still a draft (`docs/game-glossary-draft.md`): resolve them with the user before building on one reading.

## Acceptance tests

`pnpm acceptance` runs the player-language cases in `acceptance/cases/` against the running system (`pnpm dev`). A `PendingContract` failure names the driver method to implement in `acceptance/drivers/<group>.ts`. The DSL describes only what a player sees or does.

## Agent skills

### Issue tracker

Issues and PRs live in GitHub, handled with the `gh` CLI; every issue carries its `group:<name>` label. See `docs/agents/issue-tracker.md`.

### Triage labels

The five default triage labels, plus one `group:<name>` label per group. See `docs/agents/triage-labels.md`.

### Domain docs

Multi-context: `GLOSSARY-MAP.md` points to one `GLOSSARY.md` per service; system ADRs in `docs/adr/`. See `docs/agents/domain.md`.
