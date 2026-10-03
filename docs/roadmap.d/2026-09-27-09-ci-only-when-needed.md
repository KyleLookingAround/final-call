---
type: Roadmap item
section: runbook
---
- **Workflows only when needed** (`docs/decisions/ADR-2026-09-27-ci-only-when-needed.md`): Balance once per PR and again on the `balance` label, Checks skips drafts, Description only when the PR text changes, Parts not hourly, Pages only when the page can change, and Catch up starts Checks but never Balance. Measure: workflow runs per merged PR, against the day before.
