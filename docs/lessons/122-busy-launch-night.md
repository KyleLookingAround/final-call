---
type: Lesson
theme: merge-chasing
---
# A busy `main` with Catch up running: #114 playbooks, #122 usage counts · 28 Sep 2026

- **Numbers:** #114: estimate $4, $7.35 and 299k by the merge; opened 04:41, merged 05:22; Catch up merged `main` into the branch four times in 41 minutes (once needing a manual `git merge` after a rejected push, the rest fast-forwards). #122: estimate $5, about $21 by the merge (four times over); opened 05:30, merged 10:03, nearly all of it CI and merge-chasing (the code and checks were green well before 06:00). `main` moved about ten times in its life, and Catch up restarted Checks on every new head.
- **Lessons:**
  - #122 stopped waiting for a stable head: once Checks had passed on several heads and Balance was green, the squash-merge was attempted against whatever head GitHub reported (`expectedHeadSha`) and succeeded, though a Checks run for that exact commit was still going. → Since #134 auto-merge and the `check` ruleset do this waiting, and a session no longer merges by hand except when auto-merge fails (`steward` playbook, "Done").
  - Without `CATCH_UP_TOKEN`, a PR shows a confusing mix of `action_required` and job-less `failure` runs beside a `workflow_dispatch` run that's the one that matters (#114). → Read the dispatched run's own conclusion (`steward` playbook, "Catching up with `main`").
  - #122: neither Balance nor Description fired on the PR's `opened` event, nor Description on a later `edited`, though other PRs from the same account did get runs; adding the `balance` label started Balance, and Description has no `workflow_dispatch`, so it could never be forced (closing and reopening is forbidden). The body was checked by hand and the gap written into the PR. Seen once; if it recurs, add a `workflow_dispatch` trigger to `description.yml` (harmless, it only reads the current title and body).
  - A brief's instruction to commit text "unchanged" can conflict with the repo's checks (#114: the `brief` check needs the literal words "touch" and "needs-owner"); the brief's "the committed copy wins" clause is the escape hatch, with a minimal meaning-preserving wording change.
  - Budget for launch-night traffic: #122's $5 estimate became $21 because of the merge-chase, a real conflict with #111 in `03-state.js` (folding in `main`'s new `ADDED` mechanism for the `migrate` hashes), and two full local checks. A brief this size should budget for concurrent-session traffic, not for "a couple of merge attempts".
  - The fresh review caught a stale "no cap on sessions" line in the roadmap's source file and a case-sensitivity gap in the new footer-stripping regex (#114); pinning the merge call to the exact head SHA avoided a race with `main` moving every minute.
