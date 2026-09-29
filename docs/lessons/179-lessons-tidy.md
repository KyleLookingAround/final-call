Theme: tidy
# #179 Tidy the lessons · 29 Sep 2026

- **Numbers:** 11 lessons new since the last tidy (#169, earlier the same day; the last one ran 03:56 UTC, this one started 18:49, so about 15 hours). Before: 61 lesson files (50 listed in `.last-tidy`). After: 54, including this one. 10 removed: 2 deleted outright (`159-release-p2-moments`, `167-balance-compare`) and 8 merged, #126 and #175 into `175-releases.md` and #164, #165, #166, #170, #171 and #172 into `172-release-audit-batches.md`, so 8 sources became 2 files. Started 18:49 UTC; the PR opened at about 18:55 (docs only, one small check added, no bot run). `get_session` reported no cost yet at that stopping point; the rate limit read `allowed`. Estimate about $6.
- **What changed:** every file has a `Theme:` line, none added. The fixes for lessons seen three times are in the `coordinator` (handed-over work, briefs that settle questions, three default-model sessions), `balance` (measure a lever's share) and `release` (What's new title) playbooks, and in a new `rules` check for README placeholders.
- **Went well:** the previous tidy's playbook lines meant most of the new lessons' → items were already written in; grepping the playbooks for each one's key phrase before writing anything turned a dozen candidate edits into six.
- **Lessons:**
  - Lessons from one release wave (the audit's batches) were the bulk of what was new, and they repeated each other's method (side-by-side copies, `PLAY` identical, measure first). Merging them by wave rather than by batch kept each PR's numbers and cut the repeats.
  - #171 and #172 had been left without a `Theme:` line; a first-line check on lesson files would catch it, but `tools/join.mjs` isn't in a tidy's remit, so it's noted here rather than changed.
