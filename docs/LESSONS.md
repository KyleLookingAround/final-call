# Lessons from each PR

After a PR merges, look back at the session that built it: what it cost, what slowed it, and what would have saved time or credits (the `steward` playbook's last step). A lesson marked → changed something, and says where.

- **One file per PR:** `docs/lessons/<pr>-<short-name>.md` (`main-<short-name>.md` for a change pushed straight to `main`), in the shape the others have: `# Title · date`, then **Numbers**, **Went well** and **Lessons**, one line each, with → where a lesson changed something. Never add an entry to this file: the list below is joined from the folder by `node tools/join.mjs` (`npm run build` runs it).
- **The tidy.** Once 8 lessons are new since the last tidy (`node tools/join.mjs` counts them against `docs/lessons/.last-tidy`), the session that added the 8th fires the tidy Routine (the `coordinator` playbook has its id). The tidy merges lessons that say the same thing, groups them by theme (a `Theme:` first line), deletes those out of date or already written into a playbook, the notes or a check, and turns a lesson seen three times without a → into a change (`docs/briefs/lessons-tidy.md`).

## The lessons

<!-- joined:lessons from docs/lessons/ by tools/join.mjs: don't edit between these lines -->
### Balance

- [Release batch F1: tips that point the right way · 29 Sep 2026](lessons/148-release-f1-tips.md)
- [The first level-up in the first morning (#117) · 28 Sep 2026](lessons/117-early-first-level.md)
- [#101 A rating that reflects the last day, measured and switched on; a network you have to keep, specced · 27 Sep 2026](lessons/101-balance-rating.md)
- [Game logic ideas · 27 Sep 2026](lessons/57-game-logic-ideas.md)

### Checks

- [#156 Systems refactor 7, part 2: arrivals, movement and the index in one pass · 28 Sep 2026](lessons/156-refactor-passes-merge.md)
- [#150 Release P1: the first level-up and the guided start · 28 Sep 2026](lessons/150-first-level-up-card.md)
- [#145 Systems refactor 7, part 1: passengers by state · 28 Sep 2026](lessons/145-refactor-passes-index.md)
- [The terminal as a place: the checks refresh · 28 Sep 2026](lessons/144-terminal-place-checks-refresh.md)
- [A page size budget check (#140) · 28 Sep 2026](lessons/140-page-size.md)
- [#116 A network you have to keep · 28 Sep 2026](lessons/116-network-to-keep.md)
- [Famous faces (#111) · 28 Sep 2026](lessons/111-famous-faces.md)
- [#98 Systems refactor 8: weather in one place · 27 Sep 2026](lessons/98-refactor-weather.md)
- [#95 Systems refactors 4 and 6: clock tables and day stats · 27 Sep 2026](lessons/95-refactor-clocks.md)
- [The terminal as a place: checks first · 27 Sep 2026](lessons/90-terminal-place-checks.md)
- [Passengers who suddenly sped down the piers (#82) · 27 Sep 2026](lessons/89-pax-movement.md)
- [Polish: Reports and the region at night · 27 Sep 2026](lessons/80-reports-region-night.md)
- [Tell players when a new version is ready · 27 Sep 2026](lessons/64-update-toast.md)
- [#33 Level-up redesign · 27 Sep 2026](lessons/33-level-up-redesign.md)
- [#30 Level-up card · 27 Sep 2026](lessons/30-level-up-card.md)
- [#28 Sound · 27 Sep 2026](lessons/28-sound.md)

### Ci

- [Day in a minute (#102) · 28 Sep 2026](lessons/102-day-in-a-minute.md)
- [#46 Runbook experiment [B], first half: cache Playwright's Chromium · 27 Sep 2026](lessons/46-ci-cache.md)
- [#45 Weekly health check · 27 Sep 2026](lessons/45-health-check.md)
- [#43 Description check · 27 Sep 2026](lessons/43-description-check.md)

### Coordinator

- [#134 Playbooks without Routines, auto-merge, CI time limit · 28 Sep 2026](lessons/134-playbooks-no-routines.md)
- [Coordinator playbook: limits by plan, helper agents · 27 Sep 2026](lessons/59-coordinator-limits.md)
- [Coordinator playbook · 27 Sep 2026](lessons/42-coordinator-playbook.md)
- [One session for four PRs (#28, #30, #32, #33) · 27 Sep 2026](lessons/34-one-session-four-prs.md)

### Correctness

- [Release F2, goals and levels that lead (#149) · 28 Sep 2026](lessons/149-release-f2-goals.md)

### Cost

- [The overnight stall, 27–28 Sep 2026](lessons/main-overnight-stall.md)

### Docs

- [Roadmap tidy: move what has shipped out of Now · 28 Sep 2026](lessons/141-roadmap-tidy.md)
- [Rebuild figures and the moving walkways follow-up · 27 Sep 2026](lessons/97-docs-rebuild-figures.md)
- [#39 Saves on the device only · 27 Sep 2026](lessons/39-device-saves.md)
- [#20 Slimmer project notes and parallel-work lessons · 26 Sep 2026](lessons/20-slimmer-notes.md)

### Drawing

- [Gate cards, the Pier B mover, and walking through walls (#119, #120, #121) · 28 Sep 2026](lessons/127-phone-bugs.md)
- [The terminal as a place: groundwork, with refactor 9 · 28 Sep 2026](lessons/113-terminal-groundwork.md)
- [The region map, looking better · 27 Sep 2026](lessons/108-region-map-looks.md)
- [Version 31: the real airport brought together · 27 Sep 2026](lessons/67-real-airport-together.md)

### Merge-chasing

- [#122 Anonymous usage counts for launch week · 28 Sep 2026](lessons/122-usage-counts.md)
- [#114 Playbooks: the usage limit, the watchdog, and fewer wasted rounds · 28 Sep 2026](lessons/114-playbook-limits.md)
- [#94 Fewer clashes between sessions · 27 Sep 2026](lessons/94-fewer-clashes.md)
- [Quiet the noise: fold repeated incidents, expire toasts, clear stale tips · 27 Sep 2026](lessons/92-polish-noise.md)
- [#88 Masterplan on a small phone · 27 Sep 2026](lessons/88-masterplan-small-phone.md)
- [Systems refactor 3: one effects ledger · 27 Sep 2026](lessons/85-effects-ledger.md)
- [Rebuilding twice no longer stops the game (#83, bug #78) · 27 Sep 2026](lessons/83-fix-rebuild-twice.md)
- [Systems refactor 2: routes and demand in one file · 27 Sep 2026](lessons/81-refactor-routes.md)
- [#46 Runbook experiment [B], second half: only the touched check groups on drafts · 27 Sep 2026](lessons/79-ci-touched.md)
- [A Ko-fi link · 27 Sep 2026](lessons/54-kofi-link.md)

### Parts

- [Real airport parts: #50 planes, #55 vehicles, #52 roofs, #53 markings, #61 weather · 27 Sep 2026](lessons/50-real-airport-parts.md)
- [#36 Runbook experiment [A]: briefs, the owner's queue, cost budgets, parts together · 27 Sep 2026](lessons/36-session-briefs.md)
- [Bringing the terminal together (version 28) · 27 Sep 2026](lessons/26-terminal-together.md)
- [#24 Market place · 26–27 Sep 2026](lessons/24-market-place.md)
- [#23 Arrivals · 27 Sep 2026](lessons/23-arrivals.md)
- [#22 Departures · 26 Sep 2026](lessons/22-departures.md)
- [#21 Baggage system · 26 Sep 2026](lessons/21-baggage.md)
- [#19 Airport hotel · 26 Sep 2026](lessons/19-hotel.md)
- [#18 Terminal halls, and running five parts at once · 26 Sep 2026](lessons/18-terminal-halls.md)

### Releases

- [Version 32: ready for what's next · 27 Sep 2026](lessons/main-release-32.md)
- [#126 Cut release 34: famous faces and a real-looking region · 28 Sep 2026](lessons/126-release-34.md)
- [#118 Cut release 33: a rating that keeps you on your toes · 28 Sep 2026](lessons/118-release-33.md)

### Review

- [Polish audit · 27 Sep 2026](lessons/main-polish-audit.md)
- [#159 Release batch P2: moments you can hear and see · 28 Sep 2026](lessons/159-release-p2-moments.md)
- [Release audit (#155) · 28 Sep 2026](lessons/155-release-audit.md)
- [Launch polish audit · 27 Sep 2026](lessons/106-launch-audit.md)
- [Photo mode (#100) · 27 Sep 2026](lessons/100-photo-mode.md)
- [Polish: overlay cards that match · 27 Sep 2026](lessons/87-overlay-cards.md)
- [Systems review · 27 Sep 2026](lessons/66-systems-review.md)
- [#47 Runbook experiment [E]: a fresh review before opening · 27 Sep 2026](lessons/47-reviewer-step.md)

### Saves

- [Release R1: never freeze or lose a save (#158) · 28 Sep 2026](lessons/158-release-r1-saves.md)
- [Refactor 5: save migration as a table · 27 Sep 2026](lessons/86-save-fields.md)

### Specs

- [#142 A Roadmap tab on What's new: the spec · 28 Sep 2026](lessons/142-roadmap-tab-spec.md)
- [#138 Multiple floors: the terminal-place spec refreshed · 28 Sep 2026](lessons/138-terminal-place-spec-refresh.md)
- [#49 The terminal as a place: the spec, checks planned first · 27 Sep 2026](lessons/49-terminal-place-spec.md)
- [Real airport groundwork, spec and parts' briefs · 27 Sep 2026](lessons/38-real-airport-groundwork.md)

### Terminal

- [Two floors in Classic · 29 Sep 2026](lessons/162-terminal-place-floors.md)

### Tidy

- [#131 Tidy the lessons · 28 Sep 2026](lessons/131-lessons-tidy.md)

### Tools

- [#60 Idea board, September 2026 · 27 Sep 2026](lessons/60-idea-board.md)
- [A feedback link in Help · 27 Sep 2026](lessons/44-feedback-link.md)
- [#32 Knowledge graph · 27 Sep 2026](lessons/32-knowledge-graph.md)

### Ui

- [What's new, easier to read and act on · 28 Sep 2026](lessons/129-whats-new-card.md)
- [#124 Polish the first minute on a phone · 28 Sep 2026](lessons/124-polish-first-minute.md)
- [Polish: put things where players look (#112) · 28 Sep 2026](lessons/112-polish-where-to-look.md)
- [#107 The phone's top bar back on one row · 27 Sep 2026](lessons/107-phone-topbar.md)
- [Polish: phone chrome and touch targets · 27 Sep 2026](lessons/84-phone-chrome.md)
- [#51 Clear roofs at the starting zoom · 27 Sep 2026](lessons/63-roofs-clear.md)
<!-- /joined:lessons -->
