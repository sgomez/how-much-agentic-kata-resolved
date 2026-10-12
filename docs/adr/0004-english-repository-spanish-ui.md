---
status: accepted
---

# An English-only repository with a Spanish UI

The students speak Spanish and the game is Spanish, but everything that goes into the repository or GitHub is English: code, identifiers, comments, tests, commit messages, issues, specs, tickets, PRs, ADRs, glossaries and contract schemas. The only exception is the user-facing text of `apps/web` (and the default labels of `@hmk/ui`), written in Spanish from Spain. Agents converse with each person in their own language. We chose this because the agent skills, the tools' documentation and the models' strongest vocabulary are English, and one language per artifact keeps the ubiquitous language from splitting into translations (`Partida` in one file, `Game` in the next).

## Considered Options

- **Spanish domain names with English technical suffixes** (`partida.aggregate.ts`), as an earlier draft of ADR-0002 proposed. Rejected: identifiers would mix languages, and every skill and prompt would have to translate.
- **Everything in Spanish.** Rejected: the skills and tooling are English, and the agents would keep drifting between languages.

## Consequences

- Glossaries are English, and the Spanish words players see live only in `apps/web` screens.
- The `commit-msg` hook rejects messages that are not Conventional Commits or contain Spanish-only characters.
