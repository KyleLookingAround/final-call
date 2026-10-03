---
type: Brief
---
# Brief: Two floors in Classic (#133, step 3)

The owner approved the refreshed `docs/specs/terminal-place.md` on 28 Sep (#139). The checks refresh (#144) and refactor 7 (#145 and #156) have merged. This is the spec's order of work, step 3. It is the last feature before the release: the owner wants two floors in, then a refactor, fix, balance and polish sweep, then a public release. So it must ship polished, not as a part waiting for others.

## Goal and what it may touch

- Stack Classic's halls on two floors, as the spec's "What they see" and "How it works" describe:
  - **Departures upstairs** (`fl` 1): check-in, security, the market place and the gate lounges.
  - **Arrivals below** (`fl` 0): immigration, reclaim, customs, the arrivals hall, the baggage hall and the hotel walkway.
  - No two rooms on one floor overlap.
- **Escalators and a lift** go between the floors as floor links in Classic's own `term` table: `[hall, hall, x, y, half-width, 'esc'|'lift'|'stairs', people a minute]`.
  - Passengers queue for a floor link like a door, and `p.famL` passengers take the lift.
  - Late runners take the stairs or escalator, never the lift.
  - Bags never use floor links.
  - `paxEase`'s catch-up through `p.doors` includes floor links, so nobody is drawn crossing a floor.
- **Tapping a hall's name, an advisor tip or a board line** flies the camera there and switches `R.floor` to that hall's floor.
- **Old saves** put each passenger on their hall's floor, or at the nearest doorway on that floor if the hall moved.
- **Counters, lanes, booths, carousels and queues** that move with a hall read their places from the layout's table, not from constants.
- **The other layouts keep one floor for now:** their camera bar shows only **Roof** and **Halls**, not Departures and Arrivals showing the same plan. Classic shows Roof, Departures and Arrivals. Their own floor plans come after the release.
- **Switch on its pending checks** by taking their lines out of `tools/checks/pending.txt`: the `floors:` block (nine checks) and `scene: one floor at a time`. Say in the PR how each failed on `main` and passes now. Fix a pre-written check only for a real mistake, and say what and why ([D]).
- **Its What's new fragment** is `src/updates.d/two-floors.md`, in the card's shape (`src/updates.d/README.md`).
- **Screenshots** of Classic's three stops and one other layout's two stops: at phone (390×844 and 320×568), tablet (768×1024) and desktop (1440×900), by day and night, zoomed out and at 1.6×. Look at them before the PR opens and fix what looks unfinished. Players will see this first.
- Branch `feature/terminal-place-floors` from `main`, one PR, labelled `part:terminal-place`.
- Files and hooks it may touch:
  - a new `src/game/` file after the last one on `main` (floor links' queues, the lift, old saves, hall taps)
  - Classic's `term` table in `42-terminal.js`
  - the places in `43`–`47` that read the table
  - `drawRooms` in `40-layout-drawing.js` and the parts' `TERM_DRAW` entries, so each draws only its floor
  - the floor chip and `setFloor` in `53-roofs.js`
  - `route` and `walk` in `41-airside.js` only if a floor link's queue needs it
  - `paxEase`
  - `tools/checks/floors.mjs` and `pending.txt` as above
  - `docs/systems/terminal.md`, `docs/systems/airport-scene.md` and a new `docs/systems/floors.md`
  - the What's new fragment, and a look back in `docs/lessons/`
  - this brief as `docs/briefs/terminal-place-floors.md`

  Anything else is outside the brief.

## Read first

- The project notes, then `node tools/graph.mjs floors`, `node tools/graph.mjs 42-terminal.js`, `node tools/graph.mjs route`, `node tools/graph.mjs paxEase` and `node tools/graph.mjs setFloor`, and only what they list.
- `docs/specs/terminal-place.md` ("How it works", "Saved state", "Balance", "Speed budget", "Checks"), `docs/systems/terminal.md`, `docs/systems/airport-scene.md`, `tools/checks/floors.mjs` and `tools/checks/lib/place.mjs`, refactor 7's look backs in `docs/lessons/` (it changed how the passenger loop runs), and the checks refresh's look back.

## Speed budget

- **Drawing:** 25% of what's left in each scene, from the spec's table. The tightest is the zoomed-in phone: 25% of 0.086×. Measure the median of three runs on the branch against three on `main`, alternately on the same machine, and put both in the PR.
- **Simulation:** 0.02× on the late-game `perf` check. The throttled phone at sixteen stands must not fall by more than 0.3 game minutes a second; refactor 7 should have won some back, so record it.
- **Balance:** walks change, so the Balance workflow runs when the PR leaves draft. Pacing must stay within 15% of `tools/baseline.json` on seeds 1–3, keeping Classic and rebuilding. If it leaves tolerance, stop and say so in the PR, with the numbers.

## Commit author

KyleLookingAround <KyleMck10@hotmail.com> (the session-start hook sets it; check `git config user.email`).

## Who merges and when

The session, once Checks, Balance (within tolerance) and Description are green:
1. Write the look back into the PR, including [D]: (a) game-code bugs a pre-written check caught before the PR opened, (b) bugs found after, (c) pre-written checks fixed.
2. Mark it ready and turn on auto-merge (squash).
3. Subscribe to its events and book one `send_later` to confirm the merge and the Pages publish, then stop.

The Parts workflow's comment is advisory: this is the only part open. After opening the PR, read its description back and remove any "Generated by" footer or session link.

## What's left for others

- Not this session. After it merges, the coordinator runs a refactor sweep, fix and balance batches, and polish batches, from the release audit (`docs/ideas/release-audit.md`, #155, including a short list for the terminal), then the release.
- Parked until after the release: windows and watchers, decor and local names, the roof terrace floor, each layout's own floor plan, the Roadmap tab (#137), and income (on hold).
- Don't start any session yourself.

## When to stop and ask

- Only for something irreversible or outside this brief.
- Otherwise, if it truly needs the owner: open an issue labelled `needs-owner` with the question and the option it will take by default, carry on with other work, look at the issue at each stopping point, and take the default after 12 hours with no answer. Say so in the PR.
- Where it's merely unclear, take the safer option (easier to undo, or changing the game less) and say so in the PR.

## Cost budget

- Estimate: about $25. That covers:
  - a stacked plan for one layout
  - floor links with queues, a lift and stairs for runners
  - places moved into the table
  - old saves
  - ten checks switched on
  - the chip for one-floor layouts
  - balance on three seeds
  - screenshots at four sizes
- At each stopping point (a PR opened, CI back, a merge), read `get_session`: `usage.cost_usd` against the estimate (a 0 means not yet known, not free), and `rate_limit_info`. If status is "rejected" or `isUsingOverage` is true, schedule a `send_later` for a minute after `resetsAt` and end the turn. The owner has said to ignore `allowed_warning`.
- Starting another session (`create_session`)? Don't: only the coordinator starts sessions.
- Past twice the estimate: say why in the PR and in its look back, and trim or split what's left (the places table can go first as its own PR).
