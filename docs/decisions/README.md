# Decision records

Short records of decisions that shape the code, so later changes know what they must keep and why.

- One decision per file: `ADR-YYYY-MM-DD-short-slug.md`, dated the day it was made.
- A record is approved when the PR that adds it is merged. Until then it's a proposal.
- Don't rewrite an approved record. To change course, add a new one and mark the old one `Superseded` with a link to its replacement.
- Write one when a change sets a rule other changes must follow, rules out an obvious alternative, or would surprise someone reading the code later.

The list is joined from the files here by `node tools/join.mjs` (`npm run build` runs it): add a record by adding its file, never a row.

<!-- joined:decisions from the ADR files here by tools/join.mjs: don't edit between these lines -->
| Record | Decision |
| --- | --- |
| [ADR-2026-09-26-layouts-as-data](ADR-2026-09-26-layouts-as-data.md) | Airport layouts are data over one stand model (superseded in part) |
| [ADR-2026-09-26-managers-decide-by-value](ADR-2026-09-26-managers-decide-by-value.md) | Managers decide by measured value, a little at a time |
| [ADR-2026-09-26-old-saves-always-load](ADR-2026-09-26-old-saves-always-load.md) | Every older save keeps loading, forever |
| [ADR-2026-09-26-one-page-no-dependencies](ADR-2026-09-26-one-page-no-dependencies.md) | The game ships as one HTML page with no runtime dependencies |
| [ADR-2026-09-26-seeded-randomness](ADR-2026-09-26-seeded-randomness.md) | The simulation uses a seeded random generator |
| [ADR-2026-09-26-source-in-numbered-files](ADR-2026-09-26-source-in-numbered-files.md) | The source is numbered files joined into one script |
| [ADR-2026-09-26-stand-frames-and-rooms](ADR-2026-09-26-stand-frames-and-rooms.md) | Stands have their own frames, and airside is rooms joined by doorways |
| [ADR-2026-09-26-terminal-halls-and-parts](ADR-2026-09-26-terminal-halls-and-parts.md) | The terminal is halls, and its parts plug in |
| [ADR-2026-09-27-ci-minutes](ADR-2026-09-27-ci-minutes.md) | A public repo, and CI that cancels superseded runs (superseded) |
| [ADR-2026-09-27-ci-only-when-needed](ADR-2026-09-27-ci-only-when-needed.md) | Run each workflow only when its result can change |
| [ADR-2026-09-27-fewer-clashes](ADR-2026-09-27-fewer-clashes.md) | One file per entry, lists joined from them, and PRs kept up to date with main (an experiment) |
| [ADR-2026-09-27-knowledge-graph](ADR-2026-09-27-knowledge-graph.md) | A map of the code and docs, generated from the source (an experiment) |
| [ADR-2026-09-27-reviewer-step](ADR-2026-09-27-reviewer-step.md) | A fresh review before each PR opens (an experiment) |
| [ADR-2026-09-27-roof-is-a-floor](ADR-2026-09-27-roof-is-a-floor.md) | The roof is a floor the player picks, not a zoom |
| [ADR-2026-09-27-session-briefs](ADR-2026-09-27-session-briefs.md) | Sessions start from a checked brief, ask the owner through issues, keep to a cost budget, and parts are tested together (an experiment) |
<!-- /joined:decisions -->
