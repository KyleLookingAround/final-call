Theme: checks

# Decor and local character · 30 Sep 2026

- **Numbers:**
  - Estimate $16; the session record read $7.60 when the PR opened. Started 23:08 UTC; PR #184 opened as a draft at 23:57 after two commits.
  - `npm run check`: 452/452 with 3 pending (the floor plans part's). Five pending checks switched on. The `decor` group takes about 3 s locally. One container restart during a rerun, no hours waiting on the owner.
- **[D]:**
  - (a) No game-code bugs caught by the pre-written checks before opening: four passed on the first build.
  - (b) None yet.
  - (c) One fix: `decor: nothing to place` compares `G` with a snapshot of `DEFAULT()`'s keys (`tools/checks/lib/default-keys.json`) taken on 27 Sep, so fields `main` added since (the terrace's, famous faces', the usage counts') read as new saved fields. The snapshot was refreshed from `main` at c598599.
- **Balance:** drawing only; the Balance workflow's compare job (the `refactor` label) on the PR.
- **Went well:**
  - Working out decor from the checks' own obstacle list (every counter, queue slot, doorway and the walks between doorways) and placing it along the walls let `never in the way` pass in all nine layouts first time, with nothing tuned per layout.
  - The in-page A/B (the `TERM_DRAW` entry out and back in, #183's lesson) put decor at about 0.015 ms a frame up to 1.6×, where whole `scene` runs swung ±0.03×.
- **Lessons:**
  - A check's snapshot of `main` (saved keys, a recorded state) goes stale as other parts merge, and a checks-first check can fail on it before the part's code is even there. Print the check's own reading on `main` first: here the five "new saved fields" were all `main`'s.
  - `never in the way` treats every doorway as a square of its half-width: Classic's upper halls each have a doorway as wide as the hall, so decor there fits only in thin strips at the side walls. A later floor plan with narrower doorways gets more decor for free; widening the rule would need the coordinator.
  - The fresh review caught what no check measures: a length cap that looked safe left almost every local shop named for one place. A check of "at least three places" can pass on murals alone; count what each kind of sign takes, not only the total.
