# Decision records

Short records of decisions that shape the code, so later changes know what they must keep and why.

- One decision per file: `ADR-YYYY-MM-DD-short-slug.md`, dated the day it was made.
- A record is approved when the PR that adds it is merged. Until then it's a proposal.
- Don't rewrite an approved record. To change course, add a new one and mark the old one `Superseded` with a link to its replacement.
- Write one when a change sets a rule other changes must follow, rules out an obvious alternative, or would surprise someone reading the code later.

| Record | Decision |
| --- | --- |
| [ADR-2026-09-26-one-page-no-dependencies](ADR-2026-09-26-one-page-no-dependencies.md) | The game ships as one HTML page with no runtime dependencies |
| [ADR-2026-09-26-old-saves-always-load](ADR-2026-09-26-old-saves-always-load.md) | Every older save keeps loading, forever |
| [ADR-2026-09-26-source-in-numbered-files](ADR-2026-09-26-source-in-numbered-files.md) | The source is numbered files joined into one script |
| [ADR-2026-09-26-seeded-randomness](ADR-2026-09-26-seeded-randomness.md) | The simulation uses a seeded random generator |
| [ADR-2026-09-26-layouts-as-data](ADR-2026-09-26-layouts-as-data.md) | Airport layouts are data over one stand model (superseded in part) |
| [ADR-2026-09-26-stand-frames-and-rooms](ADR-2026-09-26-stand-frames-and-rooms.md) | Stands have their own frames, and airside is rooms joined by doorways |
| [ADR-2026-09-26-managers-decide-by-value](ADR-2026-09-26-managers-decide-by-value.md) | Managers decide by measured value, a little at a time |
