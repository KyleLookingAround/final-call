---
type: Lesson
theme: review
---
# #47 Runbook experiment [E]: a fresh review before opening · 27 Sep 2026

- **Numbers:** session `session_016m4g3NhqFbyAZLveBkhwDn`, estimate $4: $1.72 and 129k of 1M context by the time checks came back, $4.01 by the second merge-in, past the estimate by the third. Created 11:51, PR opened 11:55 (four minutes), Checks green at 12:01 (six minutes) — the feature itself was done and green well before the merge-chase started.
- **The trial review:** run on its own PR, as the brief asked. A fresh helper agent, given the diff against `main`, the brief and the project notes, reported no bugs, no broken rules, and no doc lines outside the diff left stale — it checked the README, `docs/SYSTEMS.md` and step cross-references by hand, the class of miss #39 showed. It flagged one non-defect (the new `docs/ROADMAP.md` bullet has no tracking issue, unlike its neighbours), and needed no fixes.
- **Went well:** the review cost was small next to the review it stood in for doing later or not at all: about 96k of the session's tokens and a few minutes, against a $4 budget.
- **Lessons:**
  - First trial found nothing, so it doesn't yet show whether the step catches a real miss; measured on the next five PRs (`docs/ROADMAP.md`), including PRs with game code where a broken rule or a stale check is more likely.
  - `main` moved a long way (many PRs, several sessions merging at once) while this PR sat open, needing three separate merges before it would go in, and the first push's CI never started at all (no check runs on its head commit) — the same busy-`main` pattern the Ko-fi link entry below documents in full, independently, the same day. Confirms it's the runbook's bottleneck right now, not this PR's.
