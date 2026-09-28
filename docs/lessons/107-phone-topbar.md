# #107 The phone's top bar back on one row · 27 Sep 2026

- **Numbers:** session `session_01QcAcdd4xFeLRUFB1MmEXQQ`, estimate $5: $2.89 when the PR opened. Started 21:40 UTC, PR opened 21:56.
- **Went well:** writing `tools/checks/topbar.mjs` first and watching it fail on `main` (320, 390 and 844×390) gave a pass/fail for every attempt, which was faster than squinting at screenshots. A `git worktree` of the commit before #84 gave the "before" pictures in one build.
- **Lessons:**
  - #84 grew the bar's buttons to 42 px with no check on the bar as a whole. A size rule on a row of controls needs a check on the row: how many fit, not just how big each is. The topbar check now covers that.
  - The map is much narrower than the screen on phones: the page gutter, and the default 40 px camera band on both sides in landscape, leave 353 px of map at 844×390 and 254 px at 667×375. Measure `#stage` before choosing breakpoints. Container queries on `.stage` are keyed to that width, so full screen and landscape come out right without extra rules.
  - A fixed-width button budget is tight: 390 portrait fits eight 40 px buttons with 2 px to spare. A new top-bar button (Photo mode's camera) has to move the steps in `shell.html` and the check with it; `docs/SYSTEMS.md` says so.
  - The PR tool added the session-link footer again, and the Description check failed on it before the read-back removed it.
