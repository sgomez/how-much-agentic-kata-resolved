# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

This repo is **multi-context**: one context per service.

## Before exploring, read these

- **`GLOSSARY-MAP.md`** at the repo root: it points at one `GLOSSARY.md` per service. Read each one relevant to the topic.
- **`docs/game-glossary-draft.md`**: the shared game-level vocabulary, a **draft** the groups resolve in the plenary. Treat its open questions as open: settle them with the user (`/grill-with-docs`), then move each resolved term into the `GLOSSARY.md` of the service that owns it.
- **`docs/adr/`**: system-wide decisions. Read the ADRs that touch the area you're about to work in. A service may also keep its own decisions in `services/<service>/docs/adr/`.

If any of these files don't exist, **proceed silently**. Don't flag their absence; don't suggest creating them upfront. The `/domain-modeling` skill (reached via `/grill-with-docs` and `/improve-codebase-architecture`) creates them lazily when terms or decisions actually get resolved.

## File structure

```
/
├── GLOSSARY-MAP.md                    ← lists the contexts and how they relate
├── docs/
│   ├── game-glossary-draft.md         ← shared draft, resolved in the plenary
│   └── adr/                           ← system-wide decisions
└── services/
    ├── catalog/
    │   ├── GLOSSARY.md                ← complete: the reference
    │   └── docs/adr/                  ← context-specific decisions (created lazily)
    ├── games/GLOSSARY.md
    ├── rounds/GLOSSARY.md
    ├── scoring/GLOSSARY.md
    └── impostor/GLOSSARY.md
```

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name, a file name), use the term as defined in the owning service's `GLOSSARY.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal: either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

Glossaries are written in English, like everything in the repo (ADR-0004).

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts ADR-0003 (queries and polling), but worth reopening because…_
