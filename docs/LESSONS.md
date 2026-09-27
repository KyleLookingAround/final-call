# Lessons from each PR

After a PR merges, look back at the session that built it: what it cost, what slowed it, and what would have saved time or credits (the `steward` playbook's last step). Newest first. A lesson marked → changed something, and says where.

## #46 Runbook experiment [B], first half: cache Playwright's Chromium · 27 Sep 2026

- **Cache is in from:** commit `32eb850` (this PR's only commit). Experiment [A]'s time-to-green for "Looks like a real airport" reads slower before that commit and faster after it for a reason unrelated to that experiment.
- **Numbers:** session `session_01AyFszbdxXR98QAxraKjCua`, estimate $5: about $2.70 by the time the PR was ready to merge. PR opened 11:54, one re-run from the Actions tab to get a cache hit (no code push needed); CI green both times. `main` moved while this PR was open, so the branch needed a merge (this one, with a `docs/LESSONS.md` conflict) before pushing.
- **The measurement itself is the lesson:** caching `~/.cache/ms-playwright` saved a few seconds on `checks.yml`'s `check` job (32s → 29s setup) and nothing measurable on `balance.yml`'s `bot` job (28s → 32s, noise). The Playwright browser download this cache skips was already fast in this environment; `install-deps`'s `apt-get` install of system libraries, which the cache doesn't touch, takes most of the 20–30s either way, cache hit or miss.
  - → Kept anyway (never slower, one less network dependency), but the second half of [B] and the weekly health check should not assume this cache is a meaningful speed-up on its own. A bigger win, if one is wanted, would cache the `apt` packages `install-deps` installs, not just the browser binary.
  - → Measuring "before" from `main`'s own recent PRs (rather than only this PR's runs) caught that the before/after difference was mostly run-to-run noise, not a real change; worth doing for any future timing claim.

## #45 Weekly health check · 27 Sep 2026

- **Numbers:** session `session_012PGwZ7jVPui6Xc9weMjmjt`, estimate $6: $4.01 and 205k of 1M context when the PR opened. Created 11:37, PR opened 11:53 (16 minutes, most of it writing and testing `tools/health.mjs` locally against a short bot run before touching CI); Checks green first time in about 7 minutes. No Balance run: no game code. `main` moved three times while this PR was open, so the branch needed two merges (one, this one, with a `docs/LESSONS.md` conflict) before pushing.
- **Lessons:**
  - `workflow_dispatch` can't be triggered on a branch until the workflow file is on the default branch, so "prove it with a manual run on the branch before merging" isn't possible for a brand-new workflow, only for one already on `main`. → No change to a playbook (out of this brief's files to touch): a brief adding a new workflow should ask for proof right after merging instead, and this entry is the record for the next one that does.
  - Recomputing the bot's own `lvlAt` against a baseline read from an override, rather than trusting the bot's own precomputed `rows`, cost one extra small script but made the forced-drift test straightforward to prove without ever touching `tools/baseline.json`.

## Coordinator playbook · 27 Sep 2026

- **Numbers, this session:** session `session_01AvgXx1pvHYkeuWni23ymZz`, estimate $4: cost and context read 0 while the PR was being built, the usual early reading (`#28` and earlier lessons). One PR, no questions for the owner.
- **Numbers, the retired coordinator:** session `session_01Y9W4q52Eb4JdVy18E9pk5o`: $176 and 642k of 1M context, over 25 hours (26 Sep 10:18 to 27 Sep 11:11).
- **Lessons:**
  - Nothing in the runbook said how a coordinator itself starts, sweeps, talks to an idle session, or hands off to the next one; it only said to keep it light. → A `coordinator` playbook (`.claude/skills/coordinator/SKILL.md`), pointed to from the `feature` playbook's "Keep the coordinator light" and the project notes' playbook list.
  - `ListAgents` and `SendMessage` don't reach an idle cloud session; `create_trigger` with `persistent_session_id` and a near `run_once_at` does. → In the new playbook, so the next coordinator doesn't have to rediscover it.

## #43 Description check · 27 Sep 2026

- **Numbers:** session `session_01AoXGiU2yJ1jzRSxvJm7cpK`, estimate $4: `usage.cost_usd` and context still read 0 at merge, as in #28's entry below. No game code, so no bot run.
- **Went well:** `.githooks/commit-msg`'s own patterns carried straight over to `actions/github-script`, and `parts.yml` was a ready template for a checkout-free job. The very first proof run needed no staging: the PR opened with a real tool footer (the bug this brief was written for), and the new check caught it and named the line unprompted.
- **Lessons:**
  - Three PRs (#38, #39, #41) had opened with a tool footer before anyone checked for it on the PR itself, only on commits. → The Description check now catches it at `opened`, `edited`, `reopened` and `synchronize`, so editing the description re-runs it without a push.
  - Listing workflow runs by file name, filtered, kept showing only the first two runs for several minutes after later edits and a push — long enough to look like `edited` had stopped firing. The PR's own check runs (`pull_request_read` → `get_check_runs`) showed the true, current state throughout. → Read a PR's live checks from the PR itself, not a separate runs listing, when timing matters.
  - `main` moved three times (#40, #41, #42) while this branch was open, all but one touching this file. → Fetch and merge `main` again right before opening a PR that's been sitting on a branch a while, not only right after branching.

## #39 Saves on the device only · 27 Sep 2026

- **Numbers:** done by the terminal's finishing session, at the owner's request, between features. PR opened 11:25, merged 11:32. One push after it opened (a docs wording fix); CI green first time. Bot STATE identical to main on seeds 1–3.
- **Lessons:**
  - The commit hook rejected the first message because it named the old hosting page, and the first docs wording named it too. The project notes forbid both. No change: describe it as "the old hosting page".
  - The clean-up touched eight files and needed no spec. Doing it in the session already open cost less than briefing a fresh one would have. → For a small clean-up (under about ten files, no new rules), the session at hand does it, if no PR is in flight.

## Real airport groundwork, spec and parts' briefs · 27 Sep 2026

- **Numbers:** session `session_01FzgcmHBgyerAkkyLvdb5kW`, estimate $20: $5.95 and 262k of 1M context by the merge ($1.55 and 149k when the PR opened). PR #38 opened 11:24, merged 11:30; CI green first time (Checks in 6 minutes, Balance's six runs in 3½). Started 07:35; the session was resumed several times, so the wall-clock time says little. No questions for the owner.
- **The knowledge graph:** three queries (`12-drawing.js`, `40-layout-drawing.js`, `perf`) named every file it needed. It read four source files whole (`12-drawing.js`, `13-camera.js`, `40-layout-drawing.js` and `check.mjs`'s perf group) and grepped for the rest, against eight to ten files for each terminal part. `perf`'s answer named the simulation's functions but not that it times only `update()`: drawing had no speed check at all, which only reading the check showed.
- **Lessons:**
  - `perf` measures the simulation, and the real airport only draws, so its headroom was the wrong budget to share. → A `scene` check now times drawing a frame against the same calibration, and the spec shares that headroom instead (`docs/specs/real-airport.md`).
  - The first drawing timings were ten times too fast: `clampCam` works out the view from the zoom before clamping it, so one call from zoom 0.01 put the camera far off the map and almost nothing was drawn. Caught because the lighting check read black pixels. → The check calls it twice; a timing that looks too good is checked against a screenshot.
  - The local `origin/main` was still the first commit, so branching from it emptied the tree. → Fetch `main` before branching from `origin/main`.

## #36 Runbook experiment [A]: briefs, the owner's queue, cost budgets, parts together · 27 Sep 2026

- **Numbers:** session `session_01D3rsa8d5gB5P9enJyeZ5Jj`: $2.60, 153k of 1M context. Created 07:22, PR opened 07:27, merged 07:34 (seven minutes open). It started with the work already written and staged by the session before it, so its cost is the finishing, not the building. One commit; CI green first time: Checks in 6 minutes (07:27–07:33), Parts together in 45 seconds (no part PRs open, so it had nothing to combine). No Balance run: no game code.
- **Went well:** the cheapest PR so far. A checked brief and a staged hand-over left the session only to verify, open, merge and confirm the publish.
- **Lessons:**
  - The Parts workflow's first real test waits for the first `part:` PR; its report script was only dry-run. → The real airport's first batch is its test; the coordinator reads its comment before merging any part.
  - The brief for the next session (`docs/briefs/real-airport.md`) was written and checked in the same PR, so this session started without a question. Measure on the real airport whether that holds for the parts' briefs.

## One session for four PRs (#28, #30, #32, #33) · 27 Sep 2026

- **Numbers:** one session built Sound, the level-up card, the knowledge graph and the level-up redesign, from 06:11 to about 07:20: $16.60, 417k of 1M context, and 45.8M tokens read back from the cache (the whole history, re-read turn after turn). Every PR was green first time, except the redesign's stray-file push. Its figures read 0 until late in the session.
- **Lessons:**
  - The knowledge graph shared no code with the game work and came with a self-contained brief, but was built in the same conversation, which re-read Sound's and the level-up's history on every turn and every CI wake. → One PR-sized item per session: the session that merges an item starts a fresh one for the next (`feature` playbook). Sound and the level-up card together were fine: they shared code, and the second was built while the first's CI ran.
  - The graph branch's build left `docs/graph.json` in the checkout; switching to the redesign branch, which didn't ignore it yet, and staging `docs` whole committed it. Caught by reading the PR's file list before merging. → Check `git status` and stage paths by name in a long-lived checkout (`feature` playbook).
  - `get_session`'s context and cost read 0 for most of the session, then filled in ($16.60 by the end), so the earlier look backs said they weren't reported. → Read them at the end of a piece of work (`feature` playbook); the cost-budget experiment can use `usage.cost_usd`.

## #33 Level-up redesign · 27 Sep 2026

- **Numbers:** asked for by the owner at about 07:00; opened 07:07, merged 07:15. One push after it opened, which removed the stray `docs/graph.json`; CI green both times.
- **Went well:** screenshots at five sizes, plus one scrolled to the chips, caught an overflowing footer button at 320 px and a cramped landscape header before the PR opened.
- **Lesson:** screenshots taken with the frame loop stopped don't always show a scroll made just before them. → No change: wait a moment after scrolling, as `build/` scripts now do.

## #32 Knowledge graph · 27 Sep 2026

- **Numbers:** built in the same session; opened 06:58, merged 07:07. No pushes after it opened; CI green first time.
- **Went well:** its first run found nine `docs/SYSTEMS.md` sections that named no files, and it has already warned that the redesign changed `49-levelup.js` without its section.
- **Lesson:** a query answers in 200–800 bytes against 41 KB of notes; whether sessions use it, and what it saves, is measured on "Looks like a real airport".

## #30 Level-up card · 27 Sep 2026

- **Numbers:** the same session as #28. It was built while #28's CI ran, opened at 06:45 and merged at about 06:58. No pushes after it opened, and CI was green first time. The session's cost is in the entry above.
- **Went well:** the unlocks come from the data the game already gates on (`STAND[i].lvl`, `capAt`, `TECH` tiers, `itemName`). The card and the game can't disagree about what a level opens, and the check asserts it against the same tables.
- **Lessons:**
  - Titles built with `aL()` carry HTML, and one went in through `textContent`; the check caught the raw `<b>`. → No change: the check compares the title text.
  - Proving play unchanged took one `PLAY` comparison instead of a hand diff of saved states, thanks to #28's lesson.

## #28 Sound · 27 Sep 2026

- **Numbers:** started 06:11, PR opened 06:33, merged 06:44. No pushes after it opened, and CI was green first time (Checks 6 min, Balance 3.5 min). Its cost is in the whole session's entry above.
- **Went well:** the level-up screen was built while CI ran, on a branch from the unmerged one, then moved onto `main` with `git rebase --onto` once #28 was squash-merged. Nothing was waiting.
- **Lessons:**
  - The bot's `STATE` changed for a change that doesn't touch play, because a release adds setting defaults and bumps What's new's `G.seen`. Proving it meant diffing the saved states by hand. → The bot prints `PLAY`, the fingerprint without `G.set` and `G.seen`; UI-only changes must leave it identical (project notes, `docs/SYSTEMS.md`, `feature` playbook).
  - The spoken-call check first counted calls over a simulated day and failed or passed by luck of the dice: final calls are rare. → Rate limits are checked with a scripted sequence of calls at chosen times, and the day's run only checks the gaps (`tools/checks/sound.mjs`).

## Bringing the terminal together (version 28) · 27 Sep 2026

- **Numbers:** a fresh finishing session, $14.80 and 375k of 1M context when #26 merged. It merged #24 (23:45) and #23 (05:56), then #26 (06:10). #26 had no pushes after it opened, and CI was green first time.
- **Went well:** the parts' speed problem had one cause, found by profiling. Passengers gained fields in many orders, so the browser saw about 300 object shapes, and every loop over them was slow. Giving every passenger one shape halved the time, with `STATE` identical on seeds 1–3. The rebalance needed no tuning: with every part in, and search staff paid, every level is within tolerance.
- **Lessons:**
  - The parts were each under the speed budget alone and over it together. Each part added its own fields to passengers, so shapes multiplied, and no part could see it alone. → New passenger fields go in `seatPax`, and fields are never deleted (`docs/SYSTEMS.md`, the terminal).
  - The session stopped to ask who merges and which author to use, though the brief had answered both. The questions went unanswered for about six hours overnight. → Sessions merge their own green PRs (project notes and `steward`). Only a balance change beyond tolerance or an open spec question waits. The session-start hook sets the commit author. The `feature` playbook has a section on working while the owner is away: don't stop on what the brief answers, take the safer option and say so, and let the brief win over the repo.
  - The `news` check's fixed waits timed out now and then in full runs. → It waits for the page's state (`R.newsBoot`).

## #23 Arrivals · 27 Sep 2026

- **Numbers:** $11.10, 245k of 1M context. Started 20:36, PR opened about 21:50, merged 05:55 the next morning. Four pushes after it opened, all by the finishing session; CI green after each.
- **Went well:** its rules got their own check group, and it needed no new hooks.
- **Lessons:**
  - The merge with main had two conflicts. Both came from parts moving the same drawing loops out of `12-drawing.js`. The brief named the resolution in advance, so it took minutes.
  - A baggage check set `R.pax` aside for three minutes, then put the old list back. That lost anyone who spawned meanwhile, and their flights never boarded, which jammed the next check. It passed on `main` only by luck of the dice. → The check now merges what arrived meanwhile (`tools/checks/baggage.mjs`).
  - Brought in with main, seed 1 reached level 1 at hour 56, outside the baseline. It was left for the rebalance with every part in, where it came back to 40.

## #24 Market place · 26–27 Sep 2026

- **Numbers:** $18.30, 383k of 1M context. Started 20:37, PR opened about 21:55, merged 23:45. Three pushes after it opened; CI red twice before that (perf and one market rule).
- **Lessons:**
  - Departures got passengers airside sooner. Under both late and standard gate calls, everyone then had time for a first shop visit, so late calls no longer meant more shopping. → The chance of browsing again now grows with the time until the gate call. A rule that depends on another part's timing needs a check that runs with both parts in, which the part checks gave.
  - The hotel check counted rooms kept for crews as free. → Fixed in the check.
  - The baggage transfer check measured a courier's cost as the change in cash, and more shopping outweighed it. → It checks the `costs` spend itself.

## #22 Departures · 26 Sep 2026

- **Numbers:** $14.10, 329k of 1M context. Started 20:36, PR opened 21:49, merged 22:24. Two commits; CI green first time.
- **Went well:** it made the game faster, because its queues move passengers through sooner (Midfield 0.36× → 0.28× on the coordinator's machine). It also warned in its PR that Midfield had little speed headroom left for the other parts.
- **Lessons:**
  - That warning was right. Together, the market place and arrivals took Midfield from 0.36× to about 0.5×, over its 0.375× budget, though each was under it alone. → Shares of the speed budget are now in the briefs (`feature` playbook, #20). The coordinator measures the parts together before merging the last of them.
  - It left the search tables' wages and the What's new entry to the coordinator. That's fine, but the list of what's left belongs in the brief, not found at the end.

## Departures, arrivals and market place, while waiting to merge · 26 Sep 2026

- **Lesson:** each part's session booked its own check-in on its PR, as well as the coordinator's. Each wake re-reads 250–380k tokens of history, and the three would have raced the coordinator to update the same branches. → The coordinator paused them. Parts now subscribe and don't book check-ins (`feature` playbook).

## #21 Baggage system · 26 Sep 2026

- **Numbers:** $21.80, 370k of 1M context. Started 20:37, PR opened 21:40, merged 22:14. Three commits, none after the PR opened; CI green first time.
- **Went well:** it stayed in its own file and hooks, and merged cleanly on top of the hotel.
- **Lessons:**
  - It kept running for about 35 minutes after opening its PR, waiting to see it merged. → Parts now subscribe to their PR's events and end their turn (`feature` playbook).
  - It ran the bot's six runs locally, then the Balance workflow ran them again. → Read the workflow's tables instead (`balance` playbook, #20).

## #20 Slimmer project notes and parallel-work lessons · 26 Sep 2026

- **Numbers:** written by the coordinating session; one push after the PR opened.
- **Lesson:** a scripted edit left the old playbooks line beside the new one. It was caught by reading the notes back before merging. No change: read the result of any scripted edit to the notes.

## #19 Airport hotel · 26 Sep 2026

- **Numbers:** $8.40, 270k of 1M context. Started 20:37, PR opened 21:03, merged 21:14. One commit; CI green first time.
- **Went well:** the cheapest and quickest part. It changed six files with three one-line hooks, and needed nothing at merge.
- **Lesson:** it merged its own PR before the coordinator had reviewed it, because the brief didn't say who merges. → Briefs say to open the PR and stop (`feature` playbook, #20).

## #18 Terminal halls, and running five parts at once · 26 Sep 2026

- **Numbers:** the coordinating session had cost $134 over 11 hours by then, against $8–22 for a whole part. Five parts plus the coordinator ran past the five-hour usage limit within the hour.
- **Lessons:**
  - A long conversation re-reads its whole history every turn, so it's the biggest cost. → Keep the coordinator short and start it fresh per feature (`feature` playbook, #20).
  - The parts started from the groundwork branch before it was squash-merged, so each one looked conflicted everywhere. → Merge the groundwork first, and use `git merge -s ours` for parts already started (`steward` playbook, #20).
  - Two parts each spent the whole `perf` headroom. → Give each part a share (`feature` playbook, #20).
  - The `news` check's click timed out once in a full run for departures and once for the coordinator, and passed alone. It waits fixed times rather than for the page's state. → To fix when the parts come together.
