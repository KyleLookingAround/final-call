---
okf_version: "0.2"
---
# Final Call's docs

The docs are a knowledge bundle in the [Open Knowledge Format](https://github.com/GoogleCloudPlatform/open-knowledge-format) (`docs/decisions/ADR-2026-10-03-docs-as-okf.md`): every file opens with frontmatter naming its type and, for most, a one-line description. This index is joined from that frontmatter, so read it to see what's here before opening a file. `node tools/okf.mjs list <type>` prints the same for one type, and `node tools/graph.mjs <name>` finds what relates to a system, file or concept.

<!-- joined:bundle from the frontmatter of every file in docs/ by tools/join.mjs: don't edit between these lines -->
# Guides

* [Version history](HISTORY.md) - Every released version, newest first, with what changed.
* [Lessons from each PR](LESSONS.md) - The look back at each merged PR, grouped by theme, and how the tidy keeps them short.
* [Five features: plan and status](PLAN.md) - The plan and status of the first five features, all built and live.
* [Roadmap](ROADMAP.md) - What's being worked on, what's next, the runbook, what's done, and ideas not yet agreed.
* [How the game works](SYSTEMS.md) - How the game is put together: files, state, time, the headless sim, build, checks, the bot, UI, views and settings.
* [Decision records](decisions/README.md) - The decision records: each one's context, the options weighed, the decision and its consequences, with the index of them all.

# Systems (`systems/`)

* [Airline operations](systems/airline-operations.md) - Crews that need rest, planes that come back late, and the Maintenance policy that services worn planes.
* [Airport layouts](systems/airport-layouts.md) - Each layout as data (stands, rooms, doorways and its own terminal), copied into the game's tables when it is built.
* [The airport scene](systems/airport-scene.md) - How the airport is drawn: the layers in order, the lighting pass, and the real airport's parts.
* [Clocks and day stats](systems/clocks.md) - The minute, hour, night and day clocks that run each system's hooks, and the day stats they keep.
* [Day in a minute](systems/day-in-a-minute.md) - A time-lapse of yesterday, recorded every five game minutes and played back over the airport in about a minute.
* [Decor and local names](systems/decor.md) - Planters, benches, art and local names in the terminal's halls, worked out from the layout and only drawn.
* [Effects: the rating and money ledger](systems/effects.md) - The one entry point for every change to the rating and to cash, and the rating that reflects the last day.
* [Famous faces](systems/famous-faces.md) - Invented celebrities who now and then fly from the airport from level 3, with a crowd, a busy hour and the rating at stake.
* [Floors](systems/floors.md) - Classic's halls on two floors, departures upstairs and arrivals below, joined by escalators, lifts and stairs.
* [Guided start](systems/guided-start.md) - The six-step tour for new games, which can be skipped or replayed from Help.
* [Late runners and passengers' stories](systems/late-runners.md) - Final call, passengers who dawdle and run for it, the gate that holds or closes, and a passenger's story.
* [Level-up card](systems/level-up-card.md) - The card that opens on each level-up and lists what it unlocks.
* [Levels and Masterplan](systems/levels-and-masterplan.md) - Levels and their requirements, goals and plan points, and the Masterplan with the plan recommended next.
* [Lowmere](systems/lowmere.md) - The rival airport that opens after City Airport and takes a share of shared routes.
* [Photo mode](systems/photo-mode.md) - Hides the panels, picks a time and sky, and saves or shares a picture of the airport.
* [Records, stamps and challenges](systems/records.md) - Personal bests, stamps and the week's challenges, each with its own toast.
* [Region](systems/region.md) - Bus, tram, rail, metro and high-speed lines, development sites, events and weather in the region round the airport.
* [Routes](systems/routes.md) - Demand, fares and the dispatcher, with the world map.
* [Saves](systems/saves.md) - Saves on the device, save codes between devices, loading older saves, and never losing one.
* [Sound](systems/sound.md) - Announcements, ambience and tones, played only from the frame loop and never changing the game.
* [The terminal](systems/terminal.md) - The terminal's halls in the order real airports use them, each layout's own plan, and how passengers move through it.
* [The roof terrace](systems/terrace.md) - The roof terrace upgrade: a deck over the concourse where passengers and spotters watch the planes while it's dry.
* [Transport manager](systems/transport-manager.md) - The manager that runs transport lines by measuring what each change is worth.
* [Update check](systems/update-check.md) - Tells players on the published site when a new version is ready.
* [Usage counts](systems/usage-counts.md) - A cookie-free page counter, so the owner can see whether anyone came from the launch posts.
* [Weather and events](systems/weather.md) - Weather cells crossing the region, and the flags that say what's on now: weather, terminal events, fuel prices and disruptions.
* [What's new](systems/whats-new.md) - The What's new card, each version's entries, and how a release adds them.
* [Windows](systems/windows.md) - Glass along the terminal's apron walls, and waiting passengers who walk to it to watch a wide-body go by.

# Decisions (`decisions/`)

* [ADR-2026-09-26: Airport layouts are data over one stand model](decisions/ADR-2026-09-26-layouts-as-data.md) - A layout is a table of stands, units and speed-ups over one stand model, with effects from what the game already simulates.
* [ADR-2026-09-26: Managers decide by measured value, a little at a time](decisions/ADR-2026-09-26-managers-decide-by-value.md) - Managers compare options by the money each is worth in the game's own model, and do the work a little at a time.
* [ADR-2026-09-26: Every older save keeps loading, forever](decisions/ADR-2026-09-26-old-saves-always-load.md) - Every older save keeps loading: new state gets a default, saved fields are never renamed or removed, and real saves are checked.
* [ADR-2026-09-26: The game ships as one HTML page with no runtime dependencies](decisions/ADR-2026-09-26-one-page-no-dependencies.md) - The game is one self-contained HTML page with no runtime dependencies; development tools never ship.
* [ADR-2026-09-26: The simulation uses a seeded random generator](decisions/ADR-2026-09-26-seeded-randomness.md) - Anything that can change the game state draws from rnd(); Math.random() is for cosmetic lines only.
* [ADR-2026-09-26: The source is numbered files joined into one script](decisions/ADR-2026-09-26-source-in-numbered-files.md) - The source is numbered files in src/game/, joined in name order into one strict IIFE.
* [ADR-2026-09-26: Stands have their own frames, and airside is rooms joined by doorways](decisions/ADR-2026-09-26-stand-frames-and-rooms.md) - Stands have their own frames and planes park nose-in; airside is convex rooms joined by doorways.
* [ADR-2026-09-26: The terminal is halls, and its parts plug in](decisions/ADR-2026-09-26-terminal-halls-and-parts.md) - The terminal is a set of halls shared by every layout, and its parts live in their own files and plug in.
* [ADR-2026-09-27: A public repo, and CI that cancels superseded runs](decisions/ADR-2026-09-27-ci-minutes.md) (deprecated) - The repo went public, and Checks and Balance cancel a run when a newer push to the same PR arrives.
* [ADR-2026-09-27: Run each workflow only when its result can change](decisions/ADR-2026-09-27-ci-only-when-needed.md) - Each workflow runs only when its result can change, keeping the cancelling of superseded runs.
* [ADR-2026-09-27: One file per entry, lists joined from them, and PRs kept up to date with main](decisions/ADR-2026-09-27-fewer-clashes.md) - Lists every session adds to are one file per entry, joined into the lists that show them, and open PRs are kept up to date with main.
* [ADR-2026-09-27: A map of the code and docs, generated from the source](decisions/ADR-2026-09-27-knowledge-graph.md) - A map of the code and docs is built from the source on every query, and the docs keep only the why as short link lines.
* [ADR-2026-09-27: The rating reflects the last day, and the level baselines move with it](decisions/ADR-2026-09-27-rating-last-day.md) - The rating reflects the last day rather than a running sum, and the level baselines move with it.
* [ADR-2026-09-27: A fresh review before each PR opens](decisions/ADR-2026-09-27-reviewer-step.md) - A fresh reviewer that hasn't seen the work reads each diff before its PR opens.
* [ADR-2026-09-27: The roof is a floor the player picks, not a zoom](decisions/ADR-2026-09-27-roof-is-a-floor.md) - The roof is a floor the player picks with the Roof button, not something zoom fades in and out.
* [ADR-2026-09-27: Sessions start from a checked brief, ask the owner through issues, keep to a cost budget, and parts are tested together](decisions/ADR-2026-09-27-session-briefs.md) - Sessions start from a checked brief, ask the owner through needs-owner issues, keep to a cost budget, and parts are tested together.
* [ADR-2026-09-28: The first level-up comes in the first morning, and level 1's baseline moves with it](decisions/ADR-2026-09-28-early-first-level.md) - The first level-up comes in the first morning, and level 1's baseline moves to 3-6 hours with it.
* [ADR-2026-09-28: A byte budget on the built page](decisions/ADR-2026-09-28-page-size-budget.md) - The built page has a byte budget, checked by the page-size group and raised only on purpose.
* [ADR-2026-10-03: The docs are a knowledge bundle in the Open Knowledge Format](decisions/ADR-2026-10-03-docs-as-okf.md) - Every docs file opens with frontmatter in the Open Knowledge Format, checked by the okf group, and level pacing is an attested computation.

# Specs (`specs/`)

* [Airport layouts](specs/airport-layouts.md) - Players rebuild their airport into different layouts, each with its own stands, costs and strengths.
* [Real airport shapes](specs/airport-shapes.md) - Layouts shaped like real airports: piers, satellites, a midfield concourse and remote stands.
* [Day in a minute](specs/day-in-a-minute.md) - A time-lapse of yesterday, played back over the airport in about a minute.
* [The first level-up in the first morning](specs/early-first-level.md) - The first level-up comes in the first morning, so newcomers get a real moment early.
* [Famous faces](specs/famous-faces.md) - Invented celebrities fly from the airport now and then, with a crowd, a busy hour and the rating at stake.
* [A feedback link in Help](specs/feedback-link.md) - A link in Help that lets players send feedback.
* [A Ko-fi link](specs/kofi-link.md) - A quiet Ko-fi link at the foot of Settings.
* [Late runners, and a passenger's story](specs/late-runners.md) - Passengers who dawdle and run for final call, and a tap on one to read their story.
* [Level-up screen](specs/level-up.md) - A card on each level-up that shows what the new level unlocks.
* [A network you have to keep](specs/network-to-keep.md) - A transport network the player has to keep up, rather than build once and forget.
* [Photo mode](specs/photo-mode.md) - Hide the panels, pick a time and sky, and save a picture of the airport.
* [Looks like a real airport](specs/real-airport.md) - The airport looks like a real one: markings, planes, roofs, weather and vehicles.
* [A Roadmap tab on What's new](specs/roadmap-tab.md) - A Roadmap tab on the What's new card that shows players what is coming.
* [Sound](specs/sound.md) - Announcements, ambience and tones for the airport.
* [Systems review: how the systems connect, and how to make choices interesting](specs/systems-review.md) - How the systems connect, the refactors that make them easier to change, and how to make choices interesting.
* [The terminal as a place](specs/terminal-place.md) - The terminal as a place: two floors, a roof terrace, windows on the apron, decor and local character.
* [A terminal that works like a real one](specs/terminal.md) - A terminal that works like a real one: check-in, security, passport control, shops, gates and arrivals.
* [A smarter transport manager](specs/transport-manager.md) - A smarter transport manager that runs lines by what each change is worth.
* [Tell players when a new version is ready](specs/update-toast.md) - Tell players when a new version of the game is ready.
* [What's new](specs/whats-new.md) - A What's new card that shows each version's changes once, and on demand.

# Metrics (`metrics/`)

* [Level pacing](metrics/level-pacing.md) - The game hour the bot reaches levels 1, 3, 5, 7 and 9 on seeds 1-3 keeping Classic, judged against the baselines.

# Attested Computations (`computations/`)

* [The bot's pacing run](computations/bot-pacing.md) - The bot's 1,200-hour run on one seed, keeping Classic, whose receipt says when it reached each level against the baselines.

# Ideas (`ideas/`)

* [Idea board, September 2026: results](ideas/board-2026-09.md) - The owner's idea board of September 2026: every idea with its rating and note, and the owner's order.
* [Ideas: the game logic](ideas/game-logic.md) - Ideas, not agreed, to improve the simulation, economy, pacing, demand, passengers, managers and how choices matter.
* [Polish audit, September 2026](ideas/polish-2026-09.md) - Everything found by playing at levels 1, 3, 5 and 9 on every screen size, ranked by how much it shows against how small the fix is.
* [Launch polish audit, September 2026](ideas/polish-launch.md) - What a first-time player arriving from a shared link notices first, found by playing and looking.
* [Release audit, 28 Sep 2026](ideas/release-audit.md) - What stood between Final Call and a polished public release on 28 Sep 2026: bugs, balance, refactors and easy wins.

# Lessons (`lessons/`)

* [#101 A rating that reflects the last day, measured and switched on; a network you have to keep, specced · 27 Sep 2026](lessons/101-balance-rating.md)
* [Day in a minute (#102) · 28 Sep 2026](lessons/102-day-in-a-minute.md)
* [Modes that take over the stage: #100 photo mode, #102 day in a minute · 27–28 Sep 2026](lessons/102-stage-modes.md)
* [The region map, looking better · 27 Sep 2026](lessons/108-region-map-looks.md)
* [Famous faces (#111) · 28 Sep 2026](lessons/111-famous-faces.md)
* [The terminal as a place: groundwork, with refactor 9 · 28 Sep 2026](lessons/113-terminal-groundwork.md)
* [#116 A network you have to keep · 28 Sep 2026](lessons/116-network-to-keep.md)
* [The first level-up in the first morning (#117) · 28 Sep 2026](lessons/117-early-first-level.md)
* [A busy `main` with Catch up running: #114 playbooks, #122 usage counts · 28 Sep 2026](lessons/122-busy-launch-night.md)
* [#122 Anonymous usage counts for launch week · 28 Sep 2026](lessons/122-usage-counts.md)
* [Phone and touch polish: #84 phone chrome, #87 overlay cards, #88 Masterplan on a small phone (scroll), #107 the top bar, #112 where players look, #124 the first minute · 27–28 Sep 2026](lessons/124-phone-polish.md)
* [Gate cards, the Pier B mover, and walking through walls (#119, #120, #121) · 28 Sep 2026](lessons/127-phone-bugs.md)
* [What's new, easier to read and act on · 28 Sep 2026](lessons/129-whats-new-card.md)
* [#131 Tidy the lessons · 28 Sep 2026](lessons/131-lessons-tidy.md)
* [The coordinator playbook and its later edits: #42 the playbook, #59 limits by plan, #134 no Routines, auto-merge, CI time limit · 27–28 Sep 2026](lessons/134-coordinator-playbook.md)
* [A page size budget check (#140) · 28 Sep 2026](lessons/140-page-size.md)
* [Docs clean-ups: #20 slimmer notes, #39 saves on the device, #97 rebuild figures, #141 roadmap tidy · 26–28 Sep 2026](lessons/141-docs-tidy-ups.md)
* [Messages that say "the owner said": #118, #122, #126, #141 · 28 Sep 2026](lessons/141-relayed-messages.md)
* [#142 A Roadmap tab on What's new: the spec · 28 Sep 2026](lessons/142-roadmap-tab-spec.md)
* [Specs for big features: #38 real airport groundwork, #49 the terminal as a place, #138 multiple floors, #142 a Roadmap tab · 27–28 Sep 2026](lessons/142-specs.md)
* [The terminal as a place: the checks refresh · 28 Sep 2026](lessons/144-terminal-place-checks-refresh.md)
* [The terminal as a place, checks first: #90 the checks, #144 the refresh · 27–28 Sep 2026](lessons/144-terminal-place-checks.md)
* [Audits by helper agents: the polish audit, #106 launch audit, #155 release audit · 27–28 Sep 2026](lessons/155-audits.md)
* [#156 Systems refactor 7, part 2: arrivals, movement and the index in one pass · 28 Sep 2026](lessons/156-refactor-passes-merge.md)
* [Systems refactors: #81 routes, #85 effects ledger, #86 save fields, #95 clocks and day stats, #98 weather, #145 and #156 passes over passengers · 27–28 Sep 2026](lessons/156-systems-refactors.md)
* [Release fix batches: #149 F2 goals, #150 P1 first level-up, #158 R1 saves, #159 P2 moments · 28 Sep 2026](lessons/159-release-fix-batches.md)
* [Two floors in Classic · 29 Sep 2026](lessons/162-terminal-place-floors.md)
* [#169 Tidy the lessons · 29 Sep 2026](lessons/169-lessons-tidy.md)
* [Release audit batches: #164 P4 labels, #165 P3 small screens, #166 F1 tips, #170 terminal polish, #171 B1 pacing, #172 loose ends · 29 Sep 2026](lessons/172-release-audit-batches.md)
* [Release docs: README, notes and the game link (#173, #174) · 29 Sep 2026](lessons/174-release-docs.md)
* [Cutting releases: version 32, #118 release 33, #126 release 34, #175 release 35 · 27–29 Sep 2026](lessons/175-releases.md)
* [The coordinator's look back: two floors to release 35 · 29 Sep 2026](lessons/176-coordinator-release-35.md)
* [Lessons from Overgrow, carried into the playbooks (#178) · 29 Sep 2026](lessons/178-lessons-from-overgrow.md)
* [#179 Tidy the lessons · 29 Sep 2026](lessons/179-lessons-tidy.md)
* [#180 A Roadmap tab on What's new · 29 Sep 2026](lessons/180-roadmap-tab.md)
* [The roof terrace floor · 29 Sep 2026](lessons/181-terrace.md)
* [Release 36: the roof terrace and the Roadmap tab · 29 Sep 2026](lessons/182-release-36.md)
* [Windows and watchers · 29 Sep 2026](lessons/183-windows.md)
* [Decor and local character · 30 Sep 2026](lessons/184-decor.md)
* [One session for four PRs: #28 sound, #30 level-up card, #32 knowledge graph, #33 level-up redesign · 27 Sep 2026](lessons/34-one-session-four-prs.md)
* [The terminal built in parts: #18 halls, #19 hotel, #21 baggage, #22 departures, #23 arrivals, #24 market place, #26 together, #36 briefs · 26–27 Sep 2026](lessons/36-terminal-parts.md)
* [#43 Description check · 27 Sep 2026](lessons/43-description-check.md)
* [A feedback link in Help · 27 Sep 2026](lessons/44-feedback-link.md)
* [#45 Weekly health check · 27 Sep 2026](lessons/45-health-check.md)
* [#47 Runbook experiment E: a fresh review before opening · 27 Sep 2026](lessons/47-reviewer-step.md)
* [Real airport parts: #50 planes, #55 vehicles, #52 roofs, #53 markings, #61 weather · 27 Sep 2026](lessons/50-real-airport-parts.md)
* [#60 Idea board, September 2026 · 27 Sep 2026](lessons/60-idea-board.md)
* [#51 Clear roofs at the starting zoom · 27 Sep 2026](lessons/63-roofs-clear.md)
* [Tell players when a new version is ready · 27 Sep 2026](lessons/64-update-toast.md)
* [Reading the game's logic: #57 game logic ideas, #66 systems review · 27 Sep 2026](lessons/66-game-logic-review.md)
* [Systems review · 27 Sep 2026](lessons/66-systems-review.md)
* [Version 31: the real airport brought together · 27 Sep 2026](lessons/67-real-airport-together.md)
* [Runbook experiment B: faster CI. #46 cache Playwright's Chromium, #79 only the touched check groups on drafts · 27 Sep 2026](lessons/79-ci-speed.md)
* [Polish: Reports and the region at night · 27 Sep 2026](lessons/80-reports-region-night.md)
* [A busy `main` before one file per entry: #54, #83, #88, and the merges other PRs needed · 27 Sep 2026](lessons/88-busy-main-before-catch-up.md)
* [Passengers who suddenly sped down the piers (#82) · 27 Sep 2026](lessons/89-pax-movement.md)
* [Quiet the noise: fold repeated incidents, expire toasts, clear stale tips · 27 Sep 2026](lessons/92-polish-noise.md)
* [#94 Fewer clashes between sessions · 27 Sep 2026](lessons/94-fewer-clashes.md)
* [Release 37: windows on the apron and decor · 30 Sep 2026](lessons/97-release-37.md)
* [The overnight stall, 27–28 Sep 2026](lessons/main-overnight-stall.md)

# Briefs (`briefs/`)

* [Brief: Balance workflow compares with the merge base, and a bot `--why` summary (#167)](briefs/balance-compare.md)
* [Brief: Measure a rating that reflects the last day, and spec a network you have to keep](briefs/balance-rating-network.md)
* [Brief: Cache Playwright's Chromium in CI (the first half of runbook experiment B)](briefs/ci-cache.md)
* [Brief: Faster CI, second half: only the touched check groups on drafts](briefs/ci-touched.md)
* [Brief: Coordinator, from 27 Sep 2026 12:15 UTC](briefs/coordinator-2026-09-27.md)
* [Brief: Coordinator, from 27 Sep 2026 13:45 UTC](briefs/coordinator-2026-09-27b.md)
* [Brief: Coordinator, from 27 Sep 2026 17:00 UTC](briefs/coordinator-2026-09-27c.md)
* [Brief: Coordinator, from 27 Sep 2026 19:55 UTC](briefs/coordinator-2026-09-27d.md)
* [Brief: Coordinator, overnight from 27 Sep 2026 21:45 UTC](briefs/coordinator-2026-09-27e.md)
* [Brief: Coordinator, 28 Sep 2026 from 05:00 UTC to the morning summary](briefs/coordinator-2026-09-28.md)
* [Brief: Coordinator, 28 Sep 2026 from 10:15 UTC](briefs/coordinator-2026-09-28b.md)
* [Brief: Coordinator, 29 Sep 2026 from about 01:00 UTC, to the public release](briefs/coordinator-2026-09-29.md)
* [Brief: Coordinator, from release 35 through launch week and the terrace](briefs/coordinator-2026-09-29b.md)
* [Brief: Coordinator, from decor through the floor plans and bringing the terminal together](briefs/coordinator-2026-09-30.md)
* [Brief: Coordinator playbook, limits by plan and helper agents](briefs/coordinator-limits.md)
* [Brief: The coordinator's look back for release 35](briefs/coordinator-look-back.md)
* [Brief: A coordinator playbook](briefs/coordinator-playbook.md)
* [Brief: Day in a minute](briefs/day-in-a-minute.md)
* [Brief: A check on PR titles and descriptions](briefs/description-check.md)
* [Brief: Rebuild figures and the moving walkways follow-up](briefs/docs-rebuild-figures.md)
* [Brief: The first level-up within about five real minutes](briefs/early-first-level.md)
* [Brief: Famous faces](briefs/famous-faces.md)
* [Brief: A feedback link in Help](briefs/feedback-link.md)
* [Brief: Fewer clashes between sessions, and a regular tidy of the lessons](briefs/fewer-clashes.md)
* [Brief: Bug: rebuilding twice stops the game](briefs/fix-rebuild-twice.md)
* [Brief: Ideas to improve the game logic](briefs/game-logic-ideas.md)
* [Brief: Weekly health check](briefs/health-check.md)
* [Brief: A new idea board for every part of the game](briefs/idea-board-2.md)
* [Brief: A Ko-fi link that stays out of the way](briefs/kofi-link.md)
* [Brief: Late runners, and a passenger's story](briefs/late-runners.md)
* [Brief: Launch polish audit](briefs/launch-audit.md)
* [Brief: Launch safety: main is green, a release cadence, and launch-day triage](briefs/launch-safety.md)
* [Brief: Launch-day triage](briefs/launch-triage.md)
* [Brief: Tidy the lessons](briefs/lessons-tidy.md)
* [Brief: A page size budget check](briefs/page-size.md)
* [Brief: Passengers who suddenly speed down the piers](briefs/pax-movement.md)
* [Brief: Three bugs from the owner's phone: gate cards, the people mover, walls](briefs/phone-bugs.md)
* [Brief: The phone's top bar back on one row](briefs/phone-topbar-one-row.md)
* [Brief: Photo mode](briefs/photo-mode.md)
* [Brief: Playbooks: the usage limit, the watchdog, and fewer wasted rounds](briefs/playbook-limits.md)
* [Brief: Playbooks without Routines, auto-merge, and a longer CI limit](briefs/playbooks-no-routines.md)
* [Brief: Polish audit](briefs/polish-audit.md)
* [Brief: Polish: the first minute on a phone](briefs/polish-first-minute.md)
* [Brief: Polish: the Masterplan on a small phone](briefs/polish-masterplan.md)
* [Brief: Polish: less noise](briefs/polish-noise.md)
* [Brief: Polish: overlay cards that match](briefs/polish-overlays.md)
* [Brief: Polish: phone chrome and touch targets](briefs/polish-phone-chrome.md)
* [Brief: Polish: Reports and the region at night](briefs/polish-reports.md)
* [Brief: Polish: put things where players look](briefs/polish-where-to-look.md)
* [Brief: Apron markings and lighting (a part of "Looks like a real airport")](briefs/real-airport-markings.md)
* [Brief: Better planes (a part of "Looks like a real airport")](briefs/real-airport-planes.md)
* [Brief: Roofs that cut away (a part of "Looks like a real airport")](briefs/real-airport-roofs.md)
* [Brief: Real airport: bring the five parts together](briefs/real-airport-together.md)
* [Brief: Vehicles on the apron (a part of "Looks like a real airport")](briefs/real-airport-vehicles.md)
* [Brief: Weather you can see (a part of "Looks like a real airport")](briefs/real-airport-weather.md)
* [Brief: "Looks like a real airport": the spec, the groundwork and the parts' briefs](briefs/real-airport.md)
* [Brief: Systems refactors 4 and 6: hook tables for the clocks, day stats as a registry](briefs/refactor-clocks.md)
* [Brief: Systems refactor 3: one effects ledger](briefs/refactor-effects.md)
* [Brief: Refactor 7, one pass over passengers (#133, step 2b)](briefs/refactor-passes.md)
* [Brief: Systems refactor 2: routes and demand in one file](briefs/refactor-routes.md)
* [Brief: Systems refactor 5: save migration as a table](briefs/refactor-saves.md)
* [Brief: Systems refactor 8: weather in one place](briefs/refactor-weather.md)
* [Brief: The region map, looking better](briefs/region-map-looks.md)
* [Brief: Release version 32](briefs/release-32.md)
* [Brief: Release version 33](briefs/release-33.md)
* [Brief: Release version 35, the public release](briefs/release-35.md)
* [Brief: Release version 36, the roof terrace and the Roadmap tab](briefs/release-36.md)
* [Brief: Release version 37, windows on the apron and decor](briefs/release-37.md)
* [Brief: Release audit, what stands between Final Call and a polished public release](briefs/release-audit.md)
* [Brief: Release batch B1, level pacing and payoffs (#147)](briefs/release-b1.md)
* [Brief: Release docs, the README and a working link to the game (#173)](briefs/release-docs.md)
* [Brief: Release batch F1, tips that point the right way (#148)](briefs/release-f1.md)
* [Brief: Release batch F2, goals and levels that lead (#149)](briefs/release-f2.md)
* [Brief: Release loose ends](briefs/release-loose-ends.md)
* [Brief: Release batch P1, the first level-up and the guided start (#150)](briefs/release-p1.md)
* [Brief: Release batch P2, moments you can hear and see (#151)](briefs/release-p2.md)
* [Brief: Release batch P3, small screens and landscape (#152)](briefs/release-p3.md)
* [Brief: Release batch P4, numbers, labels and the save panel (#153)](briefs/release-p4.md)
* [Brief: Release batch R1, never freeze or lose a save (#146)](briefs/release-r1.md)
* [Brief: Release terminal polish pass (#163)](briefs/release-terminal-polish.md)
* [Brief: A fresh review before each PR opens (runbook experiment E)](briefs/reviewer-step.md)
* [Brief: A Roadmap tab on What's new, the spec (#137)](briefs/roadmap-tab-spec.md)
* [Brief: A Roadmap tab on What's new, the build (#137)](briefs/roadmap-tab.md)
* [Brief: Roadmap tidy, move what has shipped out of Now](briefs/roadmap-tidy.md)
* [Brief: Clear roofs at the starting zoom](briefs/roofs-clear.md)
* [Brief: Runbook experiment A: briefs, the needs-owner queue, cost budgets and testing parts together](briefs/runbook-briefs.md)
* [Brief: A runbook pack the owner can take to another workspace](briefs/runbook-pack.md)
* [Brief: Systems review, for code and game design](briefs/systems-review.md)
* [Brief: Multiple floors, the checks refresh (#133, step 2a)](briefs/terminal-place-checks-refresh.md)
* [Brief: "The terminal as a place": checks first](briefs/terminal-place-checks.md)
* [Brief: Decor and local character (a part of "The terminal as a place", #133 step 3)](briefs/terminal-place-decor.md)
* [Brief: Two floors in Classic (#133, step 3)](briefs/terminal-place-floors.md)
* [Brief: The terminal as a place: groundwork, with refactor 9](briefs/terminal-place-groundwork.md)
* [Brief: Multiple floors, refresh the terminal-place spec (#133, step 1)](briefs/terminal-place-spec-refresh.md)
* [Brief: "The terminal as a place": the spec, with its checks planned first](briefs/terminal-place-spec.md)
* [Brief: The roof terrace floor (a part of "The terminal as a place", #133 step 4)](briefs/terminal-place-terrace.md)
* [Brief: Windows and watchers (a part of "The terminal as a place", #133 step 3)](briefs/terminal-place-windows.md)
* [Brief: Tell players when a new version is ready](briefs/update-toast.md)
* [Brief: Anonymous usage counts for launch week](briefs/usage-counts.md)
* [Brief: Watchdog (retired)](briefs/watchdog.md)
* [Brief: What's new, easier to read and act on](briefs/whats-new-card.md)

# Roadmap items (`roadmap.d/`)

* [2026-09-27-00-coordinator-playbook](roadmap.d/2026-09-27-00-coordinator-playbook.md)
* [2026-09-27-00-sound](roadmap.d/2026-09-27-00-sound.md)
* [2026-09-27-01-knowledge-graph](roadmap.d/2026-09-27-01-knowledge-graph.md)
* [2026-09-27-01-level-up](roadmap.d/2026-09-27-01-level-up.md)
* [2026-09-27-02-description-check](roadmap.d/2026-09-27-02-description-check.md)
* [2026-09-27-02-terminal-place](roadmap.d/2026-09-27-02-terminal-place.md)
* [2026-09-27-03-briefs-queue-budgets](roadmap.d/2026-09-27-03-briefs-queue-budgets.md)
* [2026-09-27-03-polish-audit](roadmap.d/2026-09-27-03-polish-audit.md)
* [2026-09-27-04-reviewer-step](roadmap.d/2026-09-27-04-reviewer-step.md)
* [2026-09-27-05-real-airport-trials](roadmap.d/2026-09-27-05-real-airport-trials.md)
* [2026-09-27-06-ci-cache](roadmap.d/2026-09-27-06-ci-cache.md)
* [2026-09-27-07-ci-drafts](roadmap.d/2026-09-27-07-ci-drafts.md)
* [2026-09-27-08-terminal-checks-first](roadmap.d/2026-09-27-08-terminal-checks-first.md)
* [2026-09-27-09-ci-only-when-needed](roadmap.d/2026-09-27-09-ci-only-when-needed.md)
* [2026-09-27-10-moving-walkways](roadmap.d/2026-09-27-10-moving-walkways.md)
* [2026-09-27-fewer-clashes](roadmap.d/2026-09-27-fewer-clashes.md)
* [2026-09-27-late-runners](roadmap.d/2026-09-27-late-runners.md)
* [2026-09-28-01-launch-audit](roadmap.d/2026-09-28-01-launch-audit.md)
* [2026-09-28-02-release-audit](roadmap.d/2026-09-28-02-release-audit.md)
* [2026-09-28-early-first-level](roadmap.d/2026-09-28-early-first-level.md)
* [2026-09-28-merge-queue](roadmap.d/2026-09-28-merge-queue.md)
* [2026-09-28-page-size](roadmap.d/2026-09-28-page-size.md)
* [2026-09-28-release-33](roadmap.d/2026-09-28-release-33.md)
* [2026-09-28-release-34](roadmap.d/2026-09-28-release-34.md)
* [2026-09-28-roadmap-tab](roadmap.d/2026-09-28-roadmap-tab.md)
* [2026-09-29-release-35](roadmap.d/2026-09-29-release-35.md)
* [2026-09-29-release-36](roadmap.d/2026-09-29-release-36.md)
* [2026-09-30-release-37](roadmap.d/2026-09-30-release-37.md)
<!-- /joined:bundle -->
