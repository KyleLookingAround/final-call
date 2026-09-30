# Brief: Decor and local character (a part of "The terminal as a place", #133 step 3)

The coordinator's brief for one part of `docs/specs/terminal-place.md` (approved on #139, 28 Sep 2026), refreshed on 29 Sep against `main` after windows and watchers merged (#183). Two floors in Classic (#162), refactor 7 (#145, #156), the roof terrace (#181, released in 36) and windows and watchers (#183) are in. This supersedes the 27 Sep version of this file. Each layout's own floor plan follows this part.

## Goal and what it may touch

- **Decor.** Every hall gets planters, benches, art, a grand departures board and signs, fitted to its shape.
  - Worked out from the layout's rooms, what's built (`roomOn`) and the level: more with each level, and a hall's decor arrives when the hall is built.
  - Never in a queue, lane, doorway, floor link or walkway.
  - The terrace gets its own: rail, benches, parasols, and a telescope on the public side. Leave anything `67-terrace.js` already draws there, and add only what's missing.
- **Local names.** Some shops, cafés, the terrace café and the art take their names and colours from the region's places (`PLACES`), picked with a hash of the unit's index, not `rnd()`.
- **Rules:** the player places nothing (the owner said no), decor is never saved, and it doesn't change the rating. Drawing only: `PLAY` and `STATE` identical on seeds 1–3 against the merge base. Add the `refactor` label so the Balance workflow's compare job (#177) proves it.
- **What's new:** add two fragments to `src/updates.d/`. One is for windows and watchers, which #183 left out (level 1; "Show me" the Departures stop). The other is for decor and local names.
- Switch on the five `decor:` checks by taking their lines out of `tools/checks/pending.txt`. Say in the PR how each failed on `main` and passes now.
- Branch `feature/terminal-place-decor` from `main`, one PR, labelled `part:terminal-place`.
- **Files and hooks it may touch:**
  - a new `src/game/69-decor.js`: a `decor()` worked out and cached per layout, level and what's built, `localNames()`, and their drawing as a `TERM_DRAW` entry, so it's never drawn under the roof;
  - reading `ROOMS`, `L.term`, `roomOn`, the queue slots and counters (`ciSlot`, `secSlot`, `arrSlot`, `ftSlot` and the rest `decor.mjs` names) and `PLACES`, without changing them;
  - adding to `SIMX` what `tools/checks/decor.mjs` reads (`boothPos`, `egatePos`, `carX`, `carY`, `arrSlot`, as its header says);
  - shop units' and the terrace café's names through a hook, rather than editing `46-market.js` or `67-terrace.js` beyond one line each if it must;
  - `tools/checks/decor.mjs` only to fix a mistake (say what and why);
  - guard checks elsewhere in `tools/checks/` only where the decor breaks an assumption they make; list each in the PR;
  - the two fragments;
  - a new `docs/systems/decor.md`, and the decor lines in `docs/systems/terminal.md` and `airport-scene.md`.
  Anything else is outside the brief. Search `src/game/` for each new top-level name before using it.
- Decor must follow each layout's rooms and floors (`fl`, `onFloor`), so it keeps working when the floor plans part moves halls.
- **Lessons from the terrace and windows** (`docs/lessons/181-terrace.md`, `183-windows.md`):
  - Print what a pre-written check's filter sees before changing game code to fit it.
  - After merging `main` (a release adds a newer save that checks play), rerun your own group before anything else.
  - Time the part's own drawing directly with an A/B in one page (take the layer entry out and put it back) before trimming it to fit a noisy `scene` row.
- Screenshots at phone (390×844 and 320×568, portrait and landscape), tablet (768×1024) and desktop (1440×900). By day and night, zoomed out and at 1.6×, for Classic and Midfield at levels 1, 5 and 9, and the terrace. Looked at before the PR opens, with names legible and nothing over a queue.

## Read first

- The project notes, then `node tools/graph.mjs decor`, `node tools/graph.mjs PLACES`, `node tools/graph.mjs 42-terminal.js` and `node tools/graph.mjs 46-market.js`, and only what they list.
- `docs/specs/terminal-place.md` ("What they see", "How it works", the `decor` checks); `docs/systems/terminal.md`, `airport-scene.md`, `terrace.md` and `windows.md`; `tools/checks/decor.mjs` and `tools/checks/lib/place.mjs`; the two lessons above.

## Speed budget

The spec gives decor and local names 20% of the drawing headroom and no simulation. Measure `main` on your own machine first: median of three runs on `main` and three on the branch, alternately, both in the PR. #183 measured `main` plus windows on its container as follows, with this part's share:
- Drawing (`scene`):
  - Classic desktop about 0.37×: at most +0.035×.
  - Terminal zoomed in, Classic, about 0.17×: at most +0.03×.
  - Zoomed-in Midfield phone about 0.21×: at most +0.02×.
- Cache what changes only with the layout, level or what's built, and drop fine detail when zoomed out (`V.z`).
- Simulation: none. Both `perf` rows stay where `main` has them (within ±0.02×), and nothing reachable from `update()` changes.

## Commit author

KyleLookingAround <KyleMck10@hotmail.com> (the session-start hook sets it; check `git config user.email`).

## Who merges and when

- The session, per the `steward` playbook: open the PR from `.github/pull_request_template.md`, read its description back, and remove any "Generated by" footer or session link. Subscribe to its events (`subscribe_pr_activity`) and keep a `send_later` (about 20 minutes) as the fallback.
- Record [D] in the PR: (a) game-code bugs a pre-written check caught before it opened, (b) found after, (c) pre-written checks you had to fix.
- Once the look back (`docs/lessons/<pr>-decor.md`) is in, and Checks, Description and Balance (with the compare job showing `PLAY` identical) are green, mark it ready and turn on auto-merge (squash). Then confirm the Pages publish.

## What's left for others

- Not the other terminal-place parts: each layout's own floor plan, and the PR that brings them together. They follow from their own briefs.
- No release: the coordinator starts release 37 after this merges.
- Leave `28-region-weather.js` and `54-weather.js` alone (refactor 8, later).
- At most three default-model sessions run at once. Don't start any session yourself: the coordinator does.

## When to stop and ask

- Only for something irreversible or outside this brief.
- Otherwise, if it truly needs the owner: open an issue labelled `needs-owner` with the question and the option it will take by default, carry on with other work, look at the issue at each stopping point, and take the default after 12 hours with no answer. Say so in the PR.
- Where it's merely unclear, take the safer option (easier to undo, or changing the game less) and say so in the PR.

## Cost budget

- Estimate: about $16 (decor fitted to every layout's halls and levels, local names, five checks switched on, two fragments, speed runs, screenshots at three levels and four sizes; windows cost about $15).
- At each stopping point (the PR opened, CI back, a merge), read `get_session`: `usage.cost_usd` against the estimate (a 0 means not yet known, not free), and `rate_limit_info`. If status is "rejected" or `isUsingOverage` is true, schedule a `send_later` for a minute after `resetsAt` and end the turn. Ignore `allowed_warning` (the owner's call, 29 Sep).
- Past twice the estimate: say why in the PR and in its look back, and trim or split what's left.
