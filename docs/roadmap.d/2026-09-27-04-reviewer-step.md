---
type: Roadmap item
section: done
---
- **[E] A fresh review before opening** (`docs/decisions/ADR-2026-09-27-reviewer-step.md`): before a PR opens, a fresh helper reviews the diff for bugs, broken rules and lines outside the diff the change makes wrong. Measure on the next five PRs: findings that CI or a later review would otherwise have caught, and the review's cost. **Result (lessons tidy, 29 Sep):** measured over far more than five PRs; the review found a real bug in #84, #87, #88, #90, #92, #100, #124, #127, #144, #150 and #159, and found nothing on its own first trial (#47). It stays; the `feature` playbook, step 6, now says how to brief the reviewer.
