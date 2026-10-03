---
type: Lesson
theme: review
---
# Audits by helper agents: the polish audit, #106 launch audit, #155 release audit · 27–28 Sep 2026

- **Numbers:** polish audit (16:49, 27 Sep): estimate $6, $8.74 and 196k when the PR opened, three background agents (desktop tab by tab across four levels; phone and tablet layout and touch targets; overlays, day/night and motion) and about 170 screenshots. #106: estimate $10, $16.73 and 135k, four agents on the cheaper model, about 280 screenshots. #155: estimate $15, $19.14 and 190k, five helpers (the brain itch, bugs, polish, balance, refactors), and the bot on seeds 1–3 plus about fifteen variant and bisect runs. All docs only.
- **Went well:**
  - Each agent wrote its own screenshots, looked at them and handed back a findings table, so the main session read three or four short reports instead of hundreds of images.
  - A one-page primer written once in `build/` (how to open a page, fast-forward, switch tabs and sub-tabs and open overlays, load saves, what to skip, the exact row format, what's already fixed) meant no agent rediscovered the driving hooks: the polish audit asked for it, #106 and #155 used it.
  - A scripted "reasonable player" (#155) found what no check or bot could: it follows the tips and goals as written, and the worst finding is a tip that, followed, stops the game. The bot never reads that tip. One agent reporting nothing wrong (#106: link preview, speed, big screens) still gave the "checked and fine" list that lets the owner share the link with confidence; keep asking for it.
  - Splitting by what a newcomer meets (a new game; the menus; phones; the shared link) put the two findings that matter most, the guided start's step 2 failing on a phone and the tab bar at 320 px, in front of the agent best placed to see them (#106).
- **Lessons:**
  - "No two batches share a file" collapses almost every look fix into one batch, because nearly all live in `src/shell.html` (#106): two batches, not the four or five the brief pictured. → Say in the next audit's brief that `src/shell.html` fixes form one batch.
  - Two of the polish audit's five "known issues" (rating pinned near 100, the board's one-city network) were what systems-review proposal 1 and a liked idea were about to fix; the rows say so, so a fix batch coordinates with that work rather than writing a smaller patch to be redone.
  - **The bot's table hides a level it doesn't reach** (#155): runs stop at 1,150 hours, below level 9's upper bound of 1,160, so a missing level 9 prints "not run long enough", not `off`; health issue #130 showed that row on all three seeds and was closed on levels 1–7. → Row 16 (#147) fixes the tool; until it lands, a session reading a bot table treats "not run long enough" on level 9 as `off` (`balance` playbook).
  - Three helpers couldn't write their reports (the environment refused subagents' report files), so the primer's "save it to report.md" cost each a failed step. → Ask for the report as the final message only.
  - Parallel bot runs and review scripts on four CPUs made `perf` fail in the full check; alone afterwards it passed. → Record speed baselines only on a quiet machine, after the helpers finish. #155's cost went over on the balance helper's bisect (about fifteen 1,150–1,350-hour runs), which also held the machine and was worth it (level 9 was a threshold problem, not #116's): give the balance part its own budget line.
  - #106's brief named `docs/briefs/terminal-place-groundwork.md`, which wasn't on `main`; the spec's Files section had the list. → Briefs point at the spec, which is merged, not at another session's brief. A full `npm run check` took over six and a half minutes there, so a docs-only PR leaned on CI.
  - The tool that can label issues: `issue_write`'s `create` with an unknown label name creates the label in passing (polish audit); there's no `create_label` call.
