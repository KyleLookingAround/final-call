# Lessons from each PR

After a PR merges, look back at the session that built it: what it cost, what slowed it, and what would have saved time or credits (the `steward` playbook's last step). Newest first. A lesson marked → changed something, and says where.

## A Ko-fi link · 27 Sep 2026

- **Numbers:** session `session_01Metkx2JhFRvAsn8KzuXG5C`, estimate $6: past $12 (twice the estimate) by the sixth merge attempt, entirely from the merge-chase below, not the feature. Started 11:45; the full check suite (157–166 checks across the branch's life) passed first time on every run, no page errors. `PLAY` is unaffected: nothing in `update()` changed, so no bot run was needed to prove it; the Balance workflow confirmed it once CI ran (six green `bot` jobs).
- **Went well:** the brief's "read first" list (the project notes, `node tools/graph.mjs` on the two files, the two specs) was enough; no other file needed reading before writing code. `ICON.cup` already existed, so the cup didn't need drawing. `tools/checks/kofi.mjs` (a new file) picked up its group name automatically, as the project notes describe.
- **Lessons:**
  - The level-up card's spec called it a card with a fixed foot (Masterplan/Play); the brief wanted the Ko-fi line "under the links to what's unlocked and never above them," which meant inside the scrolling body, not the fixed footer. Reading both before writing the line avoided putting it in the wrong place.
  - Screenshots needed the guided-start coach mark and spotlight hidden explicitly (`#coach`, `#spot`), not just `G.tour={done:1}`, to see the panels cleanly; the existing `levelup` check already did this for the level-up card, but not for Settings or What's new, which cost a re-shoot to notice.
  - Several sessions writing look-backs to the top of `docs/LESSONS.md` at once, and `main` moving repeatedly while this PR was open (six merges in all, one arriving between a green CI run and the merge attempt itself), gave a conflict on nearly every push; resolved by keeping every entry, newest first, in every file it touched (`LESSONS.md` every time, `ROADMAP.md` and `SYSTEMS.md` once each, where two sessions extended the same line and needed combining, not just concatenating). All of the time and cost past the estimate went here, not the feature, which was done and green well before the first merge attempt. → Matches #46's and #38's lessons already on record (retry the merge-in, don't assume the first fetch is current, and now don't assume a green mergeable check stays true for the seconds it takes to call the merge endpoint); a fourth data point that a brief's cost estimate on a day this busy should budget for several merge-chases, not zero or one.
  - GitHub Actions never ran for this PR through its normal `pull_request` trigger on its first two pushes, though `parts.yml` and `checks.yml` both fired promptly for other branches in the same minutes; a manual `workflow_dispatch` on `checks.yml` got a real signal (157/157), and the normal trigger fired correctly on every later push, so the gap looks like a dropped webhook under load rather than anything about this PR. → Don't dispatch `parts.yml` manually on a PR that isn't a split feature's part: it runs the same "combine every open `part:` PR" job regardless of which branch triggered it, and posted an unrelated failure (PRs #50 and #52 failing to report, nothing to do with this PR's diff) onto this PR's checks.

## #49 The terminal as a place: the spec, checks planned first · 27 Sep 2026

- **Numbers:** session `session_01Dvkimw2SjgEvPiF7DhWQKb`, estimate $8: $3.96 and 219k of 1M context at the merge ($3.24 at the first check-in; `get_session` gave no cost when the PR opened). Started 11:51, PR opened 11:57, approved by the owner through the coordinator at about 13:20 (under 1½ hours after the question opened, so no default was taken), merged about 13:35. CI green on every push (Checks about 6 minutes). Three merges of `main`, each with a LESSONS conflict from entries added at the top by both sides, the last one found only when the squash-merge was refused. → Merge `main` in straight before merging, not only when CI goes green.
- **The knowledge graph:** three queries (`42-terminal.js`, `50-scene.js`, `perf`) were enough. It read `42-terminal.js`, `50-scene.js`, `tools/checks/scene.mjs` and the end of `check.mjs` whole, and grepped for the rest. `perf` again named the simulation's functions but not the group's budgets; those came from the check itself.
- **Lessons:**
  - The idea board's page shows only the questions. The owner's answers are in its database (`feedback/round2`), read with `ArtifactData`, not the Artifact read. → Say so in any brief that points at the idea board.
  - Measuring showed the real airport's shares leave this bundle about 0.02× of drawing headroom. Budgets set before a bundle is built should add up across bundles, not start fresh. → The spec makes its groundwork win room back before any part spends it.
  - `perf` on this machine gave Midfield 0.129×, against 0.244× in the real airport's spec. Numbers from different machines don't compare. → The spec records the machine and asks each part for the median of three runs on its branch and on `main`.

## #60 Idea board, September 2026 · 27 Sep 2026

- **Numbers:** session `session_01JryZpLH3H7sVAKb1DwUm61`, estimate $10: about $2.70 by the time the ratings were recorded, 180k of 1M context. Board published 12:44; the owner rated all 60 ideas by 13:12 and said "done"; ratings read back and recorded the same afternoon.
- **Went well:** reusing the first board's look, votes, notes and saved state (one shared document, written as the owner goes) meant the owner rated sixty ideas in under half an hour with nothing to relearn. An order view for loved and liked ideas gave the roadmap its order straight from the board.
- **Lessons:**
  - One idea on the board, Fast track, was already in the game ("already have it"). A search for `fast.?track` missed `'Fast track lane'` because of the space. → No change to the playbooks: when checking whether an idea is built, search `UPG` names in `01-constants.js` for each word of the idea, not a joined pattern.
  - The PR tool added a "Generated by" footer to the description, and the Description check caught it within ten seconds; editing the description cleared it without a push. The check did its job.

## Game logic ideas · 27 Sep 2026

- **Numbers:** session `session_01DdCEFGD4zwqgzUBqSVLz86`, estimate $8: $3.01 and 186k of 1M context at the first merge attempt (`usage.cost_usd` was missing from `get_session` when the PR opened). Created 12:20; the three bot runs on `main` ran in the background while the code was read, and took about 12 minutes side by side. Docs only, so no Balance run.
- **Lessons:**
  - The bot's six-hourly snapshots already hold most of what a look at the game logic needs: cash, rating, the day's passengers, gates, supply against the market, idle stands and plans left. A 20-line script that divided each level requirement by its target at each snapshot showed which one holds each level back, without adding anything to the bot. No change: the brief kept `tools/` out, but a `--why` summary in the bot would save the next session that script.
  - Reading `graph.mjs` for `update`, `checkLevel` and `dayTick` pointed at the right files first time; the long one-line functions meant reading with `cut -c` to keep the context small.
  - The tool that opened the PR added a "Generated by" footer, and the Description check failed within seconds. Editing it out re-ran the check green with no push. Then `main` moved while CI ran, and the squash merge failed on a `docs/LESSONS.md` conflict, as #46 warned. No change: both are covered already.

## Coordinator playbook: limits by plan, helper agents · 27 Sep 2026

- **Numbers:** session `session_01BthEySpo492BqNkhzGTLff`, estimate $3: cost and context read 0 early on, the usual early reading. One PR, no questions for the owner.
- **Lessons:**
  - The coordinator playbook session that merged #42 did so at 12:01, before the owner's move to a Max plan and the rule on helper agents reached it: those points arrived in a message that session's PR had already merged and closed, so it never acted on them. → No change to a playbook: this is the record for the next coordinator, so it checks for a message it hasn't acted on before treating a merge as the end of the work.

## #46 Runbook experiment [B], first half: cache Playwright's Chromium · 27 Sep 2026

- **Cache is in from:** commit `32eb850` (this PR's only commit). Experiment [A]'s time-to-green for "Looks like a real airport" reads slower before that commit and faster after it for a reason unrelated to that experiment.
- **Numbers:** session `session_01AyFszbdxXR98QAxraKjCua`, estimate $5: about $2.70 by the time the PR was ready to merge. PR opened 11:54, one re-run from the Actions tab to get a cache hit (no code push needed); CI green both times. `main` moved repeatedly while this PR was open (roughly ten sessions pushing at once), so the branch needed several merges, all but one a `docs/LESSONS.md` conflict, before it would go in.
- **The measurement itself is the lesson:** caching `~/.cache/ms-playwright` saved a few seconds on `checks.yml`'s `check` job (32s → 29s setup) and nothing measurable on `balance.yml`'s `bot` job (28s → 32s, noise). The Playwright browser download this cache skips was already fast in this environment; `install-deps`'s `apt-get` install of system libraries, which the cache doesn't touch, takes most of the 20–30s either way, cache hit or miss.
  - → Kept anyway (never slower, one less network dependency), but the second half of [B] and the weekly health check should not assume this cache is a meaningful speed-up on its own. A bigger win, if one is wanted, would cache the `apt` packages `install-deps` installs, not just the browser binary.
  - → Measuring "before" from `main`'s own recent PRs (rather than only this PR's runs) caught that the before/after difference was mostly run-to-run noise, not a real change; worth doing for any future timing claim.
  - → With this many sessions merging into `main` at once, a squash-merge attempt can fail with a conflict moments after the branch looked mergeable; retry the merge-in rather than assuming the first fetch is still current.

## A feedback link in Help · 27 Sep 2026

- **Numbers:** session `session_01RcMyepPjoZed4Nu662QwAW`, estimate $6. Started from a checked brief with no questions for the owner; every check passed first time, including the new `feedback` group.
- **Went well:** the graph queries in the brief (`openHelp`, `17-help-keys-speed.js`, `38-updates.js`) named the file, its functions and where the version lives, so no wider search was needed. Faking the served location with a route interception (rather than trying to override `window.location`) let the check exercise the GitHub Pages path without real network.
- **Lesson:** `npm run preview` regenerates the link-preview image from a live save's current camera state, so it changes on every run even without a visual change; a PR that didn't touch drawing had nothing to gain from committing a new one. → No change: only commit the regenerated image after a PR that actually changes how the game looks, and check the diff isn't just run-to-run noise first.

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
