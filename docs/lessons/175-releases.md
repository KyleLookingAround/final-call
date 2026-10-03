---
type: Lesson
theme: releases
---
# Cutting releases: version 32, #118 release 33, #126 release 34, #175 release 35 · 27–29 Sep 2026

- **Numbers:** version 32: estimate $4, about $5.25 at the first stopping point, entirely from the fixture bug below; docs and What's new written within six minutes. #118: estimate $6 for two small releases, about $2 at PR open; claimed the version at 04:00 UTC, opened the PR at 05:19, just past the 05:00 target. #126 (the same session): $7.79 when #118 merged, $13.37 by the time #126 merged and its Pages publish was confirmed (past twice the estimate), almost all of it the multi-hour rate-limit stall and CI status polling while repo-wide contention made each check run 10+ minutes.
- **Went well:**
  - Claiming the version by creating the branch on GitHub first, before any of that night's feature PRs merged, meant no race for the number though five PRs landed in the next hour (#118).
  - `node tools/join.mjs` listed the exact fragments waiting; a diff of `FIELDS` in `03-state.js` against the v32 fixtures' commit confirmed no saved fields changed, so no bot run or fixtures were needed, the biggest cost saver (#118). #126: the `migrate` check's `ADDED` list already excluded `famous` (a genuinely new saved field) from the recorded hashes and checked it defaults, so it needed no new fixtures. → Check `ADDED` in `tools/checks/migrate.mjs` before assuming a new field needs `tools/saves/v<n>-*` regenerated (`release` playbook).
  - A 15-minute check-in loop caught each of five merges inside 50 minutes without a longer poll (#118). Reading each fragment directly, not a summary, showed #115's Fleet fragment was short enough to fold as one point (#126).
- **Lessons:**
  - **A fixture that becomes the newest save can fail `scene`** (version 32): version 30 added `G.set.lvlCard` after version 29's fixtures with no fixtures since, so the release owed a bot run `tools/saves/` said it didn't (the answer came from reading `DEFAULT()`'s diff since v29's fixture commit, not from a check). And `scene`'s "drawing never changes the game" then failed by a different amount each run: a `savedAt` a few minutes old falls inside the 90 s–3 h window (`23-boot.js`) where loading grants a welcome-back bonus scaled by wall-clock time, and the drawn and undrawn halves load a little apart. Older fixtures sit past the three-hour cap where the bonus saturates. → Backdate `savedAt` in any fixture that becomes the newest save (`release` playbook). A throwaway script that replayed the save with and without drawing and diffed `G` field by field isolated it; the amount changing between separate runs was the tell for wall-clock time.
  - The account's five-hour limit stopped #126's session mid-CI-wait on #118 at about 05:45 UTC with no wake until a coordinator noticed at 08:59. → A session waiting on CI books its next check-in for after `resetsAt` once the window is close (`steward` playbook). The 06:15/06:45 window for release 34 was missed entirely; folding at 09:27, as soon as #118 merged, kept the delay to the outage itself.
  - Both sessions received scheduled messages claiming the owner extended the cut-off: see `141-relayed-messages.md`.

## Release 35 (#175)

- **Numbers:** started 07:40 UTC on 29 Sep, ready to open by about 08:00; the brief's estimate was about $10 and `get_session` showed no cost figure (a 0 or absent one means not yet known). One bot run (seed 1, 1200) for the fixtures, one preview, one full check.
- **Went well:** the fold was mechanical because every fragment already had a lead, a sentence and a History line; the `news-card` and `rules` checks caught nothing to fix.
- **Lessons (release 35):**
  - The bot's saves carry the sim clock's `savedAt`, not a date in the past, so the backdating step needs a fixed old value: the v32 fixtures use 1700000000000, and so do these. The hash zeroes `savedAt`, so the value never changes a `GOLD` line.
  - The link preview shows the departures floor only; the camera-bar floor switch isn't in the image, so "make sure the new floors show" can't be met without changing `tools/preview-image.mjs`, which the brief keeps out of scope. Left as it is.
  - The two-floors roadmap item also holds the roof terrace and the other layouts' floors, so it stays in Now with the shipped part named; only the release audit item moved to Done.
  - Two checks assumed fragments are always waiting: `news-card` required at least one, and a spec linked a fragment file. Both fail the moment a release folds them, and only the full check shows it. → `news-card` no longer needs a waiting fragment; specs shouldn't link a fragment.
