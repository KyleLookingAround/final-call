# #180 A Roadmap tab on What's new · 29 Sep 2026

- **Numbers:** about $1.83 by `get_session` at the PR opening, against a $10 estimate; one full check, one fresh review, five sizes of screenshots. The page grew by 11,358 bytes (787,207 to 798,565), a little over the spec's 6–10 KB estimate, well inside the budget.
- **Went well:** the spec named the shape (`st, code, t, s, d, n`) and the mock-up held the styling, so the build was mostly wiring. Joining `src/roadmap.d/` at the top of `parts()` in `tools/sources.mjs`, on one line, meant the build, `where.mjs` and the `__sim` scan all saw the real list with no other tool changing.
- **Lessons:**
  - The fresh review caught a real bug the first check missed: the title was saved when the tab was tapped, so a second tap on the open tab saved "Roadmap" as the What's new title. My check tested the title with a loose pattern and never tapped the active tab twice. Check exact text, and tap the thing you're already on. → `roadmap-card` now checks the exact title and a second tap.
  - Filter chips that wrap to three lines at 320 px and 568×320 push the board out of view. Reading the screenshots caught it; the fit check only asks that the first chip is in view. A single scrolling row fixed it.
  - I waited on a background check with `pgrep -f tools/check.mjs` inside the waiting command, which matches its own command line, so it reported "still running" for over an hour after the check had finished. Wait on the PID, or look at the log's last line, not a pattern that the waiter itself contains.
