---
type: Roadmap item
section: runbook
---
- **[A] Briefs, the owner's queue, cost budgets and parts together** (#35, `docs/decisions/ADR-2026-09-27-session-briefs.md`). Measure on "Looks like a real airport", then keep or remove each:
  - **Brief template** (`docs/briefs/TEMPLATE.md`, `node tools/brief.mjs`, the `brief` check): every session and part starts from a checked brief. Measure: questions a session asks that its brief should have answered (the terminal's finishing session asked two).
  - **Needs-owner queue**: an issue labelled `needs-owner` with a default taken after 12 hours; the session carries on meanwhile. Measure: hours idle waiting on answers (six overnight last time).
  - **Cost budget per brief**: `usage.cost_usd` against the brief's estimate at each stopping point; past twice it, a reason and a trim. Measure: sessions over twice their estimate, and cost per PR (the four-PR session cost $16.60 and used 417k of context).
  - **Parts together** (`.github/workflows/parts.yml`): `main` plus every open `part:<feature>` PR, checked together on each push and on demand, with one comment per part. Measure: how soon a combination problem shows (the terminal's showed only when brought together), and the time from the last part's merge to green. Balance tables can follow.
