# Lessons from each PR

After a PR merges, look back at the session that built it: what it cost, what slowed it, and what would have saved time or credits (the `steward` playbook's last step). A lesson marked → changed something, and says where.

- **One file per PR:** `docs/lessons/<pr>-<short-name>.md` (`main-<short-name>.md` for a change pushed straight to `main`), in the shape the others have: `# Title · date`, then **Numbers**, **Went well** and **Lessons**, one line each, with → where a lesson changed something. Never add an entry to this file: the list below is joined from the folder by `node tools/join.mjs` (`npm run build` runs it).
- **The tidy.** Once 8 lessons are new since the last tidy (`node tools/join.mjs` counts them against `docs/lessons/.last-tidy`), the session that added the 8th fires the tidy Routine (the `coordinator` playbook has its id). The tidy merges lessons that say the same thing, groups them by theme (a `Theme:` first line), deletes those out of date or already written into a playbook, the notes or a check, and turns a lesson seen three times without a → into a change (`docs/briefs/lessons-tidy.md`).

## The lessons

<!-- joined:lessons from docs/lessons/ by tools/join.mjs: don't edit between these lines -->
### Cost

- [The overnight stall, 27–28 Sep 2026](lessons/main-overnight-stall.md)

### Merge-chasing

- [#94 Fewer clashes between sessions · 27 Sep 2026](lessons/94-fewer-clashes.md)
- [#46 Runbook experiment [B], second half: only the touched check groups on drafts · 27 Sep 2026](lessons/79-ci-touched.md)

### Not sorted yet

- [Polish audit · 27 Sep 2026](lessons/main-polish-audit.md)
- [Version 32: ready for what's next · 27 Sep 2026](lessons/main-release-32.md)
- [The terminal as a place: groundwork, with refactor 9 · 28 Sep 2026](lessons/113-terminal-groundwork.md)
- [Famous faces (#111) · 28 Sep 2026](lessons/111-famous-faces.md)
- [The region map, looking better · 27 Sep 2026](lessons/108-region-map-looks.md)
- [#107 The phone's top bar back on one row · 27 Sep 2026](lessons/107-phone-topbar.md)
- [Launch polish audit · 27 Sep 2026](lessons/106-launch-audit.md)
- [Day in a minute (#102) · 28 Sep 2026](lessons/102-day-in-a-minute.md)
- [#101 A rating that reflects the last day, measured and switched on; a network you have to keep, specced · 27 Sep 2026](lessons/101-balance-rating.md)
- [Photo mode (#100) · 27 Sep 2026](lessons/100-photo-mode.md)
- [#98 Systems refactor 8: weather in one place · 27 Sep 2026](lessons/98-refactor-weather.md)
- [Rebuild figures and the moving walkways follow-up · 27 Sep 2026](lessons/97-docs-rebuild-figures.md)
- [#95 Systems refactors 4 and 6: clock tables and day stats · 27 Sep 2026](lessons/95-refactor-clocks.md)
- [Quiet the noise: fold repeated incidents, expire toasts, clear stale tips · 27 Sep 2026](lessons/92-polish-noise.md)
- [The terminal as a place: checks first · 27 Sep 2026](lessons/90-terminal-place-checks.md)
- [Passengers who suddenly sped down the piers (#82) · 27 Sep 2026](lessons/89-pax-movement.md)
- [#88 Masterplan on a small phone · 27 Sep 2026](lessons/88-masterplan-small-phone.md)
- [Polish: overlay cards that match · 27 Sep 2026](lessons/87-overlay-cards.md)
- [Refactor 5: save migration as a table · 27 Sep 2026](lessons/86-save-fields.md)
- [Systems refactor 3: one effects ledger · 27 Sep 2026](lessons/85-effects-ledger.md)
- [Polish: phone chrome and touch targets · 27 Sep 2026](lessons/84-phone-chrome.md)
- [Rebuilding twice no longer stops the game (#83, bug #78) · 27 Sep 2026](lessons/83-fix-rebuild-twice.md)
- [Systems refactor 2: routes and demand in one file · 27 Sep 2026](lessons/81-refactor-routes.md)
- [Polish: Reports and the region at night · 27 Sep 2026](lessons/80-reports-region-night.md)
- [Version 31: the real airport brought together · 27 Sep 2026](lessons/67-real-airport-together.md)
- [Systems review · 27 Sep 2026](lessons/66-systems-review.md)
- [Tell players when a new version is ready · 27 Sep 2026](lessons/64-update-toast.md)
- [#51 Clear roofs at the starting zoom · 27 Sep 2026](lessons/63-roofs-clear.md)
- [#60 Idea board, September 2026 · 27 Sep 2026](lessons/60-idea-board.md)
- [Coordinator playbook: limits by plan, helper agents · 27 Sep 2026](lessons/59-coordinator-limits.md)
- [Game logic ideas · 27 Sep 2026](lessons/57-game-logic-ideas.md)
- [A Ko-fi link · 27 Sep 2026](lessons/54-kofi-link.md)
- [Real airport parts: #50 planes, #55 vehicles, #52 roofs, #53 markings, #61 weather · 27 Sep 2026](lessons/50-real-airport-parts.md)
- [#49 The terminal as a place: the spec, checks planned first · 27 Sep 2026](lessons/49-terminal-place-spec.md)
- [#47 Runbook experiment [E]: a fresh review before opening · 27 Sep 2026](lessons/47-reviewer-step.md)
- [#46 Runbook experiment [B], first half: cache Playwright's Chromium · 27 Sep 2026](lessons/46-ci-cache.md)
- [#45 Weekly health check · 27 Sep 2026](lessons/45-health-check.md)
- [A feedback link in Help · 27 Sep 2026](lessons/44-feedback-link.md)
- [#43 Description check · 27 Sep 2026](lessons/43-description-check.md)
- [Coordinator playbook · 27 Sep 2026](lessons/42-coordinator-playbook.md)
- [#39 Saves on the device only · 27 Sep 2026](lessons/39-device-saves.md)
- [Real airport groundwork, spec and parts' briefs · 27 Sep 2026](lessons/38-real-airport-groundwork.md)
- [#36 Runbook experiment [A]: briefs, the owner's queue, cost budgets, parts together · 27 Sep 2026](lessons/36-session-briefs.md)
- [One session for four PRs (#28, #30, #32, #33) · 27 Sep 2026](lessons/34-one-session-four-prs.md)
- [#33 Level-up redesign · 27 Sep 2026](lessons/33-level-up-redesign.md)
- [#32 Knowledge graph · 27 Sep 2026](lessons/32-knowledge-graph.md)
- [#30 Level-up card · 27 Sep 2026](lessons/30-level-up-card.md)
- [#28 Sound · 27 Sep 2026](lessons/28-sound.md)
- [Bringing the terminal together (version 28) · 27 Sep 2026](lessons/26-terminal-together.md)
- [Departures, arrivals and market place, while waiting to merge · 26 Sep 2026](lessons/25-waiting-to-merge.md)
- [#24 Market place · 26–27 Sep 2026](lessons/24-market-place.md)
- [#23 Arrivals · 27 Sep 2026](lessons/23-arrivals.md)
- [#22 Departures · 26 Sep 2026](lessons/22-departures.md)
- [#21 Baggage system · 26 Sep 2026](lessons/21-baggage.md)
- [#20 Slimmer project notes and parallel-work lessons · 26 Sep 2026](lessons/20-slimmer-notes.md)
- [#19 Airport hotel · 26 Sep 2026](lessons/19-hotel.md)
- [#18 Terminal halls, and running five parts at once · 26 Sep 2026](lessons/18-terminal-halls.md)
<!-- /joined:lessons -->
