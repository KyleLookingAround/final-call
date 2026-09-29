# Lessons from each PR

After a PR merges, look back at the session that built it: what it cost, what slowed it, and what would have saved time or credits (the `steward` playbook's last step). A lesson marked → changed something, and says where.

- **One file per PR:** `docs/lessons/<pr>-<short-name>.md` (`main-<short-name>.md` for a change pushed straight to `main`), in the shape the others have: `# Title · date`, then **Numbers**, **Went well** and **Lessons**, one line each, with → where a lesson changed something. Never add an entry to this file: the list below is joined from the folder by `node tools/join.mjs` (`npm run build` runs it).
- **The tidy.** Once 8 lessons are new since the last tidy (`node tools/join.mjs` counts them against `docs/lessons/.last-tidy`), the session that added the 8th fires the tidy Routine (the `coordinator` playbook has its id). The tidy merges lessons that say the same thing, groups them by theme (a `Theme:` first line), deletes those out of date or already written into a playbook, the notes or a check, and turns a lesson seen three times without a → into a change (`docs/briefs/lessons-tidy.md`).

## The lessons

<!-- joined:lessons from docs/lessons/ by tools/join.mjs: don't edit between these lines -->
### Balance

- [#170 Release: terminal polish pass · 29 Sep 2026](lessons/170-release-terminal-polish.md)
- [Release batch F1: tips that point the right way (#148, #166) · 29 Sep 2026](lessons/166-release-f1-tips.md)
- [The first level-up in the first morning (#117) · 28 Sep 2026](lessons/117-early-first-level.md)
- [#101 A rating that reflects the last day, measured and switched on; a network you have to keep, specced · 27 Sep 2026](lessons/101-balance-rating.md)
- [Reading the game's logic: #57 game logic ideas, #66 systems review · 27 Sep 2026](lessons/66-game-logic-review.md)

### Checks

- [Release fix batches: #149 F2 goals, #150 P1 first level-up, #158 R1 saves, #159 P2 moments · 28 Sep 2026](lessons/159-release-fix-batches.md)
- [#156 Systems refactor 7, part 2: arrivals, movement and the index in one pass · 28 Sep 2026](lessons/156-refactor-passes-merge.md)
- [Systems refactors: #81 routes, #85 effects ledger, #86 save fields, #95 clocks and day stats, #98 weather, #145 and #156 passes over passengers · 27–28 Sep 2026](lessons/156-systems-refactors.md)
- [The terminal as a place: the checks refresh · 28 Sep 2026](lessons/144-terminal-place-checks-refresh.md)
- [The terminal as a place, checks first: #90 the checks, #144 the refresh · 27–28 Sep 2026](lessons/144-terminal-place-checks.md)
- [A page size budget check (#140) · 28 Sep 2026](lessons/140-page-size.md)
- [#116 A network you have to keep · 28 Sep 2026](lessons/116-network-to-keep.md)
- [Famous faces (#111) · 28 Sep 2026](lessons/111-famous-faces.md)
- [Passengers who suddenly sped down the piers (#82) · 27 Sep 2026](lessons/89-pax-movement.md)
- [Polish: Reports and the region at night · 27 Sep 2026](lessons/80-reports-region-night.md)
- [Tell players when a new version is ready · 27 Sep 2026](lessons/64-update-toast.md)

### Ci

- [Day in a minute (#102) · 28 Sep 2026](lessons/102-day-in-a-minute.md)
- [Runbook experiment [B]: faster CI. #46 cache Playwright's Chromium, #79 only the touched check groups on drafts · 27 Sep 2026](lessons/79-ci-speed.md)
- [#45 Weekly health check · 27 Sep 2026](lessons/45-health-check.md)
- [#43 Description check · 27 Sep 2026](lessons/43-description-check.md)

### Coordinator

- [Messages that say "the owner said": #118, #122, #126, #141 · 28 Sep 2026](lessons/141-relayed-messages.md)
- [The coordinator playbook and its later edits: #42 the playbook, #59 limits by plan, #134 no Routines, auto-merge, CI time limit · 27–28 Sep 2026](lessons/134-coordinator-playbook.md)
- [One session for four PRs: #28 sound, #30 level-up card, #32 knowledge graph, #33 level-up redesign · 27 Sep 2026](lessons/34-one-session-four-prs.md)

### Cost

- [The overnight stall, 27–28 Sep 2026](lessons/main-overnight-stall.md)

### Docs

- [Release docs: README, notes and the game link (#173, #174) · 29 Sep 2026](lessons/174-release-docs.md)
- [Docs clean-ups: #20 slimmer notes, #39 saves on the device, #97 rebuild figures, #141 roadmap tidy · 26–28 Sep 2026](lessons/141-docs-tidy-ups.md)

### Drawing

- [Two floors in Classic · 29 Sep 2026](lessons/162-terminal-place-floors.md)
- [Gate cards, the Pier B mover, and walking through walls (#119, #120, #121) · 28 Sep 2026](lessons/127-phone-bugs.md)
- [The terminal as a place: groundwork, with refactor 9 · 28 Sep 2026](lessons/113-terminal-groundwork.md)
- [The region map, looking better · 27 Sep 2026](lessons/108-region-map-looks.md)
- [Version 31: the real airport brought together · 27 Sep 2026](lessons/67-real-airport-together.md)

### Exchange

- [Lessons from Overgrow, carried into the playbooks (#178) · 29 Sep 2026](lessons/178-lessons-from-overgrow.md)

### Merge-chasing

- [A busy `main` with Catch up running: #114 playbooks, #122 usage counts · 28 Sep 2026](lessons/122-busy-launch-night.md)
- [#122 Anonymous usage counts for launch week · 28 Sep 2026](lessons/122-usage-counts.md)
- [#94 Fewer clashes between sessions · 27 Sep 2026](lessons/94-fewer-clashes.md)
- [Quiet the noise: fold repeated incidents, expire toasts, clear stale tips · 27 Sep 2026](lessons/92-polish-noise.md)
- [A busy `main` before one file per entry: #54, #83, #88, and the merges other PRs needed · 27 Sep 2026](lessons/88-busy-main-before-catch-up.md)

### Parts

- [Real airport parts: #50 planes, #55 vehicles, #52 roofs, #53 markings, #61 weather · 27 Sep 2026](lessons/50-real-airport-parts.md)
- [The terminal built in parts: #18 halls, #19 hotel, #21 baggage, #22 departures, #23 arrivals, #24 market place, #26 together, #36 briefs · 26–27 Sep 2026](lessons/36-terminal-parts.md)

### Releases

- [#175 Release 35, the public release · 29 Sep 2026](lessons/175-release-35.md)
- [Release P4: numbers, labels and the save panel · 29 Sep 2026](lessons/164-release-p4-labels.md)
- [Cutting releases: version 32, #118 release 33, #126 release 34 · 27–28 Sep 2026](lessons/126-releases.md)

### Review

- [Release P3, small screens and landscape · 29 Sep 2026](lessons/165-release-p3-screens.md)
- [#159 Release batch P2: moments you can hear and see · 28 Sep 2026](lessons/159-release-p2-moments.md)
- [Audits by helper agents: the polish audit, #106 launch audit, #155 release audit · 27–28 Sep 2026](lessons/155-audits.md)
- [Systems review · 27 Sep 2026](lessons/66-systems-review.md)
- [#47 Runbook experiment [E]: a fresh review before opening · 27 Sep 2026](lessons/47-reviewer-step.md)

### Specs

- [#142 A Roadmap tab on What's new: the spec · 28 Sep 2026](lessons/142-roadmap-tab-spec.md)
- [Specs for big features: #38 real airport groundwork, #49 the terminal as a place, #138 multiple floors, #142 a Roadmap tab · 27–28 Sep 2026](lessons/142-specs.md)

### Tidy

- [#169 Tidy the lessons · 29 Sep 2026](lessons/169-lessons-tidy.md)
- [#131 Tidy the lessons · 28 Sep 2026](lessons/131-lessons-tidy.md)

### Tools

- [#60 Idea board, September 2026 · 27 Sep 2026](lessons/60-idea-board.md)
- [A feedback link in Help · 27 Sep 2026](lessons/44-feedback-link.md)

### Ui

- [What's new, easier to read and act on · 28 Sep 2026](lessons/129-whats-new-card.md)
- [Phone and touch polish: #84 phone chrome, #87 overlay cards, #88 Masterplan on a small phone (scroll), #107 the top bar, #112 where players look, #124 the first minute · 27–28 Sep 2026](lessons/124-phone-polish.md)
- [Modes that take over the stage: #100 photo mode, #102 day in a minute · 27–28 Sep 2026](lessons/102-stage-modes.md)
- [#51 Clear roofs at the starting zoom · 27 Sep 2026](lessons/63-roofs-clear.md)

### Not sorted yet

- [Release loose ends · 29 Sep 2026](lessons/172-release-loose-ends.md)
- [Release B1, level pacing and payoffs (#171) · 29 Sep 2026](lessons/171-release-b1-pacing.md)
<!-- /joined:lessons -->
