# Triage Labels

The skills speak in terms of five canonical triage roles. This file maps those roles to the actual label strings used in this repo's issue tracker.

| Label in mattpocock/skills | Label in our tracker | Meaning |
| --- | --- | --- |
| `needs-triage` | `needs-triage` | Maintainer needs to evaluate this issue |
| `needs-info` | `needs-info` | Waiting on reporter for more information |
| `ready-for-agent` | `ready-for-agent` | Fully specified, ready for an AFK agent |
| `ready-for-human` | `ready-for-human` | Requires human implementation |
| `wontfix` | `wontfix` | Will not be actioned |

When a skill mentions a role (e.g. "apply the AFK-ready triage label"), use the corresponding label string from this table.

## Group labels

Every issue and PR also carries exactly one label naming the group that owns it. A change that touches shared code (`packages/*`, `apps/web/src/shell/`, `acceptance/dsl/`, root config) carries the label of the group that proposes it.

| Label | Owns |
| --- | --- |
| `group:games` | `services/games/`, `packages/contracts/src/games/`, `apps/web/src/features/games/`, `acceptance/drivers/games.ts` |
| `group:rounds` | `services/rounds/`, `packages/contracts/src/rounds/`, `apps/web/src/features/rounds/`, `acceptance/drivers/rounds.ts` |
| `group:scoring` | `services/scoring/`, `packages/contracts/src/scoring/`, `apps/web/src/features/scoring/`, `acceptance/drivers/scoring.ts` |
| `group:impostor` | `services/impostor/`, `packages/contracts/src/impostor/`, `apps/web/src/features/impostor/`, `acceptance/drivers/impostor.ts` |
