Theme: review
# Release audit (#155) · 28 Sep 2026

- **Numbers:** estimate $15; $19.14 by the time the PR opened (over the estimate, under twice it), 190k of 1M context. Started 18:50 UTC. Docs only. Five helper agents: the brain itch, bugs, polish, balance and refactors. The bot ran on seeds 1–3 plus about fifteen variant and bisect runs.
- **Went well:**
  - Giving each helper a one-page primer (`build/audit/PRIMER.md`) cut its briefs to a paragraph each. The primer covered driving `build/test.html`, loading saves, fast-forwarding, the tab ids, "look at your screenshots", and what's already fixed. That was the last audit's lesson ("a short note on driving the game headlessly"), and it worked.
  - The scripted "reasonable player" found what no check or bot could: it follows the tips and goals as written. The worst finding in the audit is a tip that, followed, stops the game (row 1). The bot never reads that tip, so no baseline could have shown it.
- **Lessons:**
  - **The bot's table hides a level it doesn't reach.** The runs stop at 1,150 hours, below level 9's upper bound of 1,160, so a missing level 9 prints "not run long enough", not `off`. Health issue #130 showed that row on all three seeds, and it was closed on levels 1–7. → Row 16 (#147) fixes the tool. Until then, a session reading a bot table treats "not run long enough" on level 9 as `off`. The `balance` playbook should say so when #147 changes the run.
  - **Three helpers couldn't write their reports** (the environment refused subagents' report files), so the reports came back only as messages. That worked, but the primer's "save it to report.md" cost each of them a failed step. → Next audit: ask for the report as the final message only.
  - **Parallel bot runs and review scripts on four CPUs made `perf` fail** in the full `npm run check`. Run alone afterwards, it passed with room to spare. → Record speed baselines only on a quiet machine, after the helpers finish, as this audit did in the end.
  - **The cost went over because of the balance helper's bisect**: about fifteen 1,150–1,350-hour runs, which also held the machine. The bisect was worth it (it showed level 9 was a threshold problem, not #116's). Next time, give the balance part its own budget line.
