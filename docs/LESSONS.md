# Lessons from each PR

After a PR merges, look back at the session that built it: what it cost, what slowed it, and what would have saved time or credits (the `steward` playbook's last step). A lesson marked → changed something, and says where.

- **One file per PR:** `docs/lessons/<pr>-<short-name>.md` (`main-<short-name>.md` for a change pushed straight to `main`), in the shape the others have: `# Title · date`, then **Numbers**, **Went well** and **Lessons**, one line each, with → where a lesson changed something. Never add an entry to this file: the list below is joined from the folder by `node tools/join.mjs` (`npm run build` runs it).
- **The tidy.** Once 8 lessons are new since the last tidy (`node tools/join.mjs` counts them against `docs/lessons/.last-tidy`), the session that added the 8th fires the tidy Routine (the `coordinator` playbook has its id). The tidy merges lessons that say the same thing, groups them by theme (a `Theme:` first line), deletes those out of date or already written into a playbook, the notes or a check, and turns a lesson seen three times without a → into a change (`docs/briefs/lessons-tidy.md`).

## The lessons

<!-- joined:lessons from docs/lessons/ by tools/join.mjs: don't edit between these lines -->
### Merge-chasing

- [#94 Fewer clashes between sessions · 27 Sep 2026](lessons/94-fewer-clashes.md)

### Not sorted yet

- [Polish audit · 27 Sep 2026](lessons/main-polish-audit.md)
- [Version 32: ready for what's next · 27 Sep 2026](lessons/main-release-32.md)
- [The terminal as a place: checks first · 27 Sep 2026](lessons/90-terminal-place-checks.md)
- [Polish: overlay cards that match · 27 Sep 2026](lessons/87-overlay-cards.md)
- [Polish: phone chrome and touch targets · 27 Sep 2026](lessons/84-phone-chrome.md)
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
