# The terminal as a place

Issue: #48 · Status: Approved (the owner approved it on 27 Sep 2026, with the default for each of its six choices; see below) · PRs: #49 (this spec; the rest added as they open)

Bundle 3 of `docs/ROADMAP.md`, plus its follow-up, each layout's own terminal floor plan (step 3 of `docs/specs/terminal.md`). From the idea board, the owner loved the two-level terminal and the viewing terrace with spotters, said yes to windows and to local character, and said no to placing decor. They also chose a richer top-down view, "both" for more to look at and more to decide, and "both" for a lively crowd and individuals. The checks come first (experiment [D]): the Checks section is the heart of this spec, and the first PR writes them before any code.

**The owner's choices (#48):**
1. Two floors from the start, in every layout.
2. Decor doesn't change the rating.
3. The terrace is a Terminal upgrade from level 3, and its café earns at most 2% of a day's income.
4. Zooming in shows departures (the upper floor) first.
5. The drawing budget stays 0.55×, and the groundwork wins room back.
6. One part draws the other eight layouts' floor plans, split in two only if its brief finds it too big.

## What the player gets

The terminal stops being one flat diagram shared by every layout. It becomes a building worth zooming into, with departures upstairs and arrivals below and escalators between them. It has glass along the apron, where passengers gather when a big jet taxis past, and a roof terrace that fills with spotters when something rare lands. Its halls carry the region's names and fill with planters, art and benches as the airport grows. Each layout gets a floor plan shaped to its own main building. The player places nothing: the decor comes with the building.

## What they see

- **Zoomed out** (roofs solid, from `docs/specs/real-airport.md`): the roof, and once it's built the terrace cut into it at the apron edge, with spotters on it. Nothing inside the halls is drawn under a solid roof.
- **Zoomed in** (roofs faded, above about 1.3×): one floor at a time. A small floor chip on the map, **Departures ▲ / Arrivals ▼**, picks which. It shows only in the airport view, only when zoomed in, and only where a layout has two floors.
  - **Upper floor (departures):** check-in, security, the market place and the gate lounges. Passengers reach the stands by the air bridges.
  - **Lower floor (arrivals):** immigration, reclaim, customs, the arrivals hall, the baggage hall and the hotel walkway.
  - **Between floors:** the concourse links both. Escalators and a lift stand where they meet. Arriving passengers ride down, and families and those who need help take the lift.
  - The other floor isn't drawn. Tapping a hall's name, an advisor tip or a board line flies the camera there and switches to its floor.
- **Windows.** Glass along every airside wall that faces the apron, with a sheen by day and lit at night: warm pools on the apron from the lighting pass. Passengers who are waiting drift to the glass when a wide-body taxis or pushes back nearby, and back to their seats. Nobody misses a flight to watch.
- **Decor that comes with the building.** Every hall gets planters, benches, art, a grand departures board and signs, fitted to its shape. More come with each level, and a hall's decor appears when the hall is built. Decor is never in a queue, lane, doorway or walkway.
- **Local character.** Some shops, cafés and the art take their names and colours from the region's places (Harbourgate, Millbrook, Castleton…): "Castleton Kitchen", "Harbourgate Coffee", a Millbrook mural. A new place in the region can name the next unit.
- **Roof terrace and spotters** (a Terminal upgrade from level 3; hidden before). A strip of roof with railings, a café kiosk and people with cameras. A handful come on an ordinary day and crowd it when something rare arrives: a type not seen here this week, a new route's first arrival, or the biggest type you handle. Fewer come at night or in rain. The crowd on the roof is the only sign: no toast, no text event.
- **Each layout's own floor plan.** The Round terminal's halls wrap the landside half of the ring, Midfield's sit in its main terminal ahead of the train, and the Satellite's and the Starfish's sit in their main buildings. The pier layouts (Remote, Staggered, Curved front, Hall and finger pier) fit Classic's plan to their own building's width.
- **In the panel:** the terrace's card, with today's spotters and takings, sits under Terminal › Staff. Nothing else is new in the panel.
- **Screens:** the floor chip fits a 320 px phone (portrait and landscape), clear of the phone camera band (Settings › Screen) and the bottom sheet's handle. Tablets and large screens show the same.

## How it works

- **Floors are a field on rooms.** A hall gets `fl` (0 lower, 1 upper); a room without it (the concourse, the forecourt) is on both. A doorway joins rooms on the same floor. A **floor link** (escalator or lift) is a doorway between floors with a capacity per minute; passengers queue for it like a door, and `p.famL` passengers take the lift. Routing (`route`, `walk`) is unchanged apart from treating links as doorways. Bags don't use floor links: the belts drop to the baggage hall.
- **Each layout lists its own terminal** (`L.term`: halls, doorways, floor links and where each part's counters sit), in place of the shared `TERM_ROOMS` and `TERM_DOORS`. The groundwork moves today's plan into Classic's entry and gives the other layouts a copy, so nothing moves until the floor plans part. Everything that places a desk, lane, booth, carousel or queue reads the layout's table, not a constant.
- **The view:** `R.floor` (runtime, `'up'` or `'down'`, defaulting to `'up'`) picks the floor drawn. The terminal's layers draw only the rooms and passengers on that floor. Nothing inside a hall is drawn where the roof is solid (`roofA`, the roofs part's opacity at the current zoom; the groundwork exposes it if the roofs part hasn't).
- **Spotters** are a count, not passengers: `R.spot` goes up and down with the hour, the weather and rare arrivals, and a sample of at most 40 is drawn. They never enter the terminal's queues. The terrace café earns a little per spotter.
- **Windows** are edges of airside rooms that face the apron, worked out from each layout's rooms. A watcher is a passenger already waiting for their gate call, within reach of the glass. They go to the glass, stay until the plane has passed, and go back, and never after their gate is called.
- **Decor** is worked out from the layout's rooms, what's built and the level. It is drawn only, never saved or placed, and has no effect on the rating (the owner's choice).
- **Local names** come from `PLACES` in the region, picked with a hash of the unit's index, not with `rnd()`, so they never change the game.
- **Unlocks:** two floors, windows, decor and local names from the start. The terrace is an upgrade from level 3, `G.lv.terrace`, hidden before. Each layout's plan comes with the layout.
- **Managers and recommendations:** nothing to manage. The advisor's tips and the board's lines fly the camera to the right floor. The duty manager ignores the terrace.
- **Fitting round the real airport:** roofs (0.9×–1.3× fade) decide when halls show. Two floors never draw under a solid roof, and the terrace is cut into the roof, drawn at every zoom. Window lights use `LIGHTS` and `lamp()`. Everything is in drawing layers (`LAYER.terminal`, `pax`, `roofs`, `lit`), with no new lines in `draw()`.

## Saved state

- `G.lv.terrace` (0 or 1), an upgrade key added with `Object.assign(UPG,{…})` like the terminal's others: `DEFAULT().lv` gives 0 and `resetAll` already fills missing keys.
- The terrace café's takings are counted in the existing income, as the hotel's are; if a new key is needed it defaults to 0.
- No other saved field: the floor shown, spotters, watchers, decor and local names are runtime or worked out.
- **Old saves:** each loads into its layout's plan. A passenger in a hall when the save loads is put on that hall's floor, or at the nearest doorway if the hall moved. Nothing is renamed or removed.

## Balance

- Walks change: stacked halls and each layout's plan change how far passengers walk, so queues and shop time shift. The pass mark is pacing within tolerance of `tools/baseline.json` on seeds 1–3, keeping Classic and rebuilding, with no tuning expected. Each part that moves halls runs the Balance workflow.
- The terrace's income is small: at most 2% of a day's income at level 9.
- Watchers and decor don't touch the rating.
- If pacing leaves tolerance, the part stops and the coordinator rebalances when the parts come together, as the terminal did.

## Speed budget

Measured on `main` before this spec (27 Sep 2026, the session's machine; three `scene` runs, one `perf` run):

| Check | `main` | Budget |
| --- | --- | --- |
| Late-game simulation | 0.152× | 0.25× |
| Sixteen stands of Midfield | 0.129× | 0.375× |
| Phone at 8×, CPU slowed 4× | 7.2 of 8 game min/s | reported |
| Phone at 8×, sixteen stands | 4.7 of 8 game min/s | reported |
| `scene`, Classic, desktop | 0.292–0.311× (median 0.297×) | 0.55× |
| `scene`, Midfield, desktop | 0.319–0.360× (median 0.351×) | 0.55× |
| `scene`, Midfield, phone | 0.307–0.349× (median 0.341×) | 0.55× |

- **Drawing.** The real airport's parts hold 0.175× of the drawing headroom. If they spend it all, the worst scene reaches about 0.53×, leaving about 0.02×, which is not enough for this bundle. So:
  1. The groundwork must win room back: it stops drawing inside halls where the roof is solid, and draws one floor, not two. Its budget is below zero: the worst scene must get faster by at least 0.03× (median of three against `main` after the real airport merges).
  2. The checks-first PR adds a second timed scene: zoomed in on the terminal at 1.6×, night, fully built Classic and Midfield, the busiest hour of a level 9 save, desktop and phone. That's where this bundle's drawing is seen. Its budget is set at 1.5 times `main`'s median when that PR opens.
  3. What's left after the groundwork in both scenes is shared: two floors 30%, windows 15%, decor and local names 25%, terrace and spotters 15%, the floor plans 15%. The coordinator writes the numbers into each part's brief after measuring.
- **Simulation.** Headroom is about 0.10× (late game) and 0.25× (Midfield) on this machine. Two floors 0.02×, windows (watchers) 0.01×, terrace (a count) 0.005×, floor plans 0.02× on Midfield. Decor and local names get none: they are drawing only.
- One run varies by about ±0.05× for drawing and ±0.02× for simulation. Each part measures its cost as the median of three runs on its branch minus three on `main`, on the same machine, and puts both in its PR. The Parts workflow checks the open parts together.

## Checks

The checks-first PR writes all of these before any code. Each is named with its group and a short phrase, so `tools/checks/pending.txt` can list it. Each gives what it sets up, what it measures and its pass mark. Checks that already pass on `main` are guards: they go in switched on. Every other check must fail on `main` for the right reason when it's written. A check that can't fail on `main` tests nothing and gets rewritten.

**How pending checks wait for code (the simplest way with `tools/check.mjs`):**
- `tools/checks/pending.txt` lists pending checks, one per line: a check's full name, or a group name and `*` for the whole group. `#` starts a comment naming the part that switches it on.
- In `ok()`, a failing pending check prints `PEND` and isn't counted as a failure. A passing pending check prints `FAIL … pending, but passes: switch it on` and **is** a failure, so a part must remove its lines when it builds them, and a vacuous check is caught.
- A group listed with `*` may throw before its code exists (a missing `__sim` function). The runner catches the throw and prints one `PEND` line for the group.
- The summary prints `N pending`. The Checks and Parts workflows need no change.
- Only the checks-first PR and the coordinator add lines. Each part removes its own lines in its PR, and the PR that brings the parts together leaves the file empty.
- A part may change a pre-written check only to fix a mistake in it, saying what and why in its PR. Loosening a pass mark needs the coordinator. Each change is counted for [D].

**Guards, on from the start:**
- `scene: drawing never changes the game`, `scene: drawing speed` (three scenes), both `perf` simulation checks, `saves`, `layout` (320 px to 2560 px), `layouts`, `terminal`, and the terminal parts' groups. They exist already and must stay green.
- `scene: drawing speed, terminal zoomed in` (new, three scenes: Classic desktop, Midfield desktop, Midfield phone). Setup: `v29-L9.json`, seed 1, one game hour of simulation, 21:00, camera at 1.6× on the terminal's middle. Measure: the same frame timing as the worst scene. Pass: at most 1.5 times `main`'s median.

**Groundwork (`plans` and `scene`):**
- `plans: every layout's terminal comes from its own table`. Setup: a new game, each of the nine layouts in turn with `switchLayout`, fully built. Measure: the rooms merged into `ROOMS` equal that layout's `L.term` halls, and `layoutFaults()` is empty. Pass: nine layouts, no faults.
- `plans: rooms and doorways have floors`. Setup: as above. Measure: every hall's `fl` is 0, 1 or absent; every doorway joins two rooms that share a floor, or is a floor link. Pass: none wrong.
- `scene: nothing is drawn inside a hall under a solid roof`. Setup: the worst scene (zoomed out, `v29-L9.json`, night, storm). Measure: spy on `TERM_DRAW` and on the `pax` layer, and count passengers and furniture drawn inside a hall where `roofA` is 1. Pass: 0.
- `scene: one floor at a time`. Setup: zoomed in at 1.6×, `R.floor='up'`, then `'down'`. Measure: passengers drawn whose room is on the other floor. Pass: 0 each way.
- `plans: the floor chip`. Setup: the airport view zoomed out, zoomed in, and the region view, on a 320×568 phone and 1440×900. Measure: the chip is shown only zoomed in, in the airport view, where the layout has two floors. Its box sits inside the canvas, clear of the camera band (`#topgap`) and the bottom sheet's handle. Tapping it switches `R.floor`. Pass: all.

**Two floors (`floors`):**
- `floors: departures upstairs, arrivals below`. Setup: Classic, fully built. Measure: `ci`, `sec` and `mkt` have `fl` 1; `imm`, `rec`, `cus`, `arh`, the baggage hall and `wlk` have `fl` 0; no two rooms on one floor overlap (intersection area 0). Pass: all.
- `floors: people change floor only on escalators and lifts`. Setup: `v29-L5.json`, seed 1, three game hours. Measure: every step where a passenger's floor changes, and its distance to the nearest floor link. Pass: every change within 12 units of a link, and at least 50 changes seen.
- `floors: families take the lift`. Setup: as above. Measure: the share of `famL` passengers who change floor by lift, and of the rest. Pass: at least 80% of `famL`, at most 5% of others.
- `floors: nobody is stuck between floors`. Setup: as above, fully built. Measure: passengers in one state for over 90 game minutes (not counting the hotel), and flights held at the door by missing passengers compared with `main` (recorded in the check by the checks-first PR). Pass: 0 stuck; held flights at most `main`'s plus 5%.
- `floors: walks stay about the same`. Setup: Classic, `v29-L5.json`, seed 1, six game hours. Measure: the mean time from the forecourt to the gate lounge, and from the stand to the forecourt, against `main`'s (recorded by the checks-first PR). Pass: each within ±15%.
- `floors: tapping a hall goes to its floor`. Setup: zoomed in, `R.floor='up'`. Measure: tapping reclaim's name, and an advisor tip about reclaim. Pass: `R.floor` becomes `'down'` and the camera centres on reclaim, both times.
- `floors: old saves land on the right floor`. Setup: every save in `tools/saves/`. Measure: after one game minute, passengers whose floor doesn't match their room's. Pass: 0 for every save.

**Windows (`windows`):**
- `windows: glass on every airside wall facing the apron`. Setup: each layout fully built. Measure: edges of airside rooms that border the apron (not another room) without glass, and glass on an edge that doesn't face the apron. Pass: 0 and 0.
- `windows: passengers watch a big jet go by`. Setup: `v29-L9.json`, seed 1; move a wide-body to push back from the stand nearest the market place's glass, scripted at a set time. Measure: waiting passengers within 8 units of glass on that side, before and during the pushback. Pass: at least 3 more during it, and every one of them boards before the door closes.
- `windows: nobody watches after their gate is called`. Setup: as above, over two game hours. Measure: watchers whose gate has been called. Pass: 0.
- `windows: lit at night`. Setup: Classic, 23:00 and 12:00. Measure: a pixel on the apron just outside the glass, with the windows' lights in and taken out. Pass: brighter with them at 23:00; the same at 12:00.

**Decor and local character (`decor`):**
- `decor: nothing to place`. Setup: `v29-L9.json`. Measure: controls in any panel that place, move or buy decor, and saved fields added by decor (`G` keys against `DEFAULT()` from before the bundle). Pass: 0 and 0.
- `decor: it comes with the building`. Setup: `v29-L1.json`, `v29-L5.json`, `v29-L9.json`. Measure: decor items per hall, and items in rooms not yet built (`roomOn`). Pass: every hall's count at L1 ≤ L5 ≤ L9, the total rising at each; 0 in unbuilt rooms.
- `decor: never in the way`. Setup: each layout fully built at L9. Measure: decor footprints overlapping a desk, kiosk, lane, booth, e-gate, carousel, queue slot (`ciSlot`, `secSlot`, `arrSlot`, `ftSlot`), doorway, floor link, or a walk path (8 units either side of the routes between doorways). Pass: 0.
- `decor: local names from the region`. Setup: `v29-L5.json`. Measure: local signs and the places they name. Pass: every local name contains a `PLACES` name; at least 3 different places; the same names after a reload (not random).
- `decor: signs fit their halls`. Setup: each layout. Measure: each sign's text width in world units against its hall's width. Pass: every sign at most the hall's width minus 16.

**Roof terrace and spotters (`terrace`):**
- `terrace: hidden until it can be built`. Setup: `v29-L1.json`, then the same airport set to level 3. Measure: the upgrade in the Terminal tab, the card, the terrace drawn, spotters. Pass: none at L1; the upgrade shown at L3, and the rest once it's bought.
- `terrace: seen at every zoom`. Setup: bought, Classic, by day; zoomed out (roof solid) and at 1.6×. Measure: pixels over the terrace against the roof's colour. Pass: different from the roof at both zooms.
- `terrace: spotters crowd for something rare`. Setup: `v29-L9.json` with the terrace, seed 1; a scripted arrival of the biggest type, then an ordinary one, each at 14:00 on a dry day. Measure: `R.spot` before and 30 game minutes after each. Pass: after the rare one at least 12 and three times before; after the ordinary one within ±20%; back within 20% of before inside three game hours.
- `terrace: fewer at night and in rain`. Setup: as above. Measure: `R.spot` at 02:00, and at 14:00 with `R.fx.rain` on and off. Pass: at most 2 at 02:00; rain at most half of dry.
- `terrace: the crowd is the only sign`. Setup: the rare arrival above. Measure: toasts and board lines added. Pass: none.
- `terrace: spotters stay on the roof`. Setup: a game day. Measure: spotters in any terminal queue, and drawn spotters. Pass: 0 in queues; at most 40 drawn.
- `terrace: small takings`. Setup: `v29-L9.json`, a game day. Measure: the terrace's takings against the day's income. Pass: more than 0 and at most 2%.
- `terrace: its card fits a phone`. Setup: 320×568 and 390×844 phones. Measure: sideways overflow of Terminal › Staff with the card. Pass: none.

**Each layout's floor plan (`plans`):**
- `plans: halls inside each main building`. Setup: each layout fully built. Measure: halls outside the layout's main building outline, or overlapping an airside room or a stand's frame. Pass: 0.
- `plans: the way through, in order, in every layout`. Setup: as above. Measure: routes from the forecourt to each gate lounge, and back from each stand. Pass: departures pass `ci`, `sec`, `mkt` in that order; arrivals pass `imm`, `rec`, `cus`, `arh`; no route joins a departures hall to an arrivals hall except through the airside concourse.
- `plans: no layout's walk is a trap`. Setup: each layout fully built, the same seed. Measure: the mean forecourt-to-gate walk distance. Pass: every layout within 0.7–1.5× of Classic's.
- `plans: every layout plays two hours`. Setup: each layout fully built, seed 1. Measure: errors, and passengers stuck over 90 game minutes. Pass: none.
- `plans: rebuilding moves people into the new plan`. Setup: `v29-L9.json`, mid-hour, switch to each unlocked layout. Measure: passengers outside any room on their floor after the switch. Pass: 0.
- `plans: old saves load into their layout's plan`. Setup: every save in `tools/saves/`. Measure: passengers outside any room after load. Pass: 0.
- Screenshots: `layouts` adds each layout's upper and lower floor at desktop size; the parts add their own at phone, tablet and desktop, by day and night, zoomed out and in.

**Measuring [D].** For each part, its PR records:
- (a) bugs in game code that a pre-written check caught before the PR opened;
- (b) bugs in game code found after it opened: CI red from its own code, real bugs from review, and problems found when the parts came together or after merge;
- (c) pre-written checks it had to fix, and how.

Baseline, the terminal's five parts (`docs/LESSONS.md`): three game-code bugs found after PRs opened or at bringing together (the parts' speed together, late gate calls no longer meaning more shopping, level 1's pacing on seed 1), about 0.6 a part; plus three check bugs found late (the hotel's crew rooms, the courier's cost, the baggage check losing passengers). [D] stays if (b) is at most half the terminal's (0.3 a part) and the checks-first PR costs under 15% of the bundle. The look back after the last part records the result in `docs/LESSONS.md`.

## Order of work

1. **Checks first** (one PR, from `main` after this spec is approved): the pending mechanism in `tools/check.mjs`, `tools/checks/pending.txt`, and the groups `floors`, `windows`, `decor` and `terrace` (new files in `tools/checks/`). It adds the `plans` checks and the zoomed-in scene to `terminal.mjs` or a new `plans.mjs`, whichever reads better, and records `main`'s numbers the checks compare with. It shows each pending check failing on `main` for the right reason, and is green with them pending. No game code.
2. **Groundwork** (one PR, after the real airport has merged, since it needs roofs): floors on rooms, floor links as doorways, `L.term` per layout with today's plan in each, `R.floor` and the chip, nothing drawn under a solid roof, and `roofA` if the roofs part doesn't give it. `PLAY` identical on seeds 1–3; the worst scene at least 0.03× faster. It switches on the groundwork's checks and writes the parts' briefs with their measured shares.
3. **First batch, three parts side by side**, each from `main` after the groundwork, labelled `part:terminal-place`:
   - two floors in Classic (halls stacked, escalators and the lift, old saves);
   - windows and watchers;
   - decor and local character.
4. **Second batch, two parts**, once the first has merged:
   - the roof terrace and spotters;
   - each layout's own floor plan (all eight other layouts, using two floors). If its brief finds it too big, it splits into the pier layouts and the rest.
   Both may go to the cheaper model (experiment [C]) if their briefs are routine.
5. **Bring it together:** balance on seeds 1–3 keeping Classic and rebuilding, the speed of every part together, `pending.txt` empty, screenshots of every layout's two floors by day and night, the What's new entry and version, save fixtures, link previews and `docs/SYSTEMS.md`. Then the [D] look back.

## Files

- **Checks first:** `tools/check.mjs` (the pending list), `tools/checks/pending.txt`, `floors.mjs`, `windows.mjs`, `decor.mjs`, `terrace.mjs`, and `plans.mjs` or `terminal.mjs`.
- **Groundwork:** `41-airside` (floors and floor links in routing), `42-terminal` (`L.term` in place of the shared tables), `39-layouts` (each layout's entry), `43`–`47` (places read from the layout's table), and `50-scene` (one floor, nothing under a solid roof).
- **Parts:** each in its own new file, numbered after the real airport's (from 56): `56-floors`, `57-windows`, `58-decor`, `59-terrace`, `60-plans`. They edit only the tables and hooks their briefs name.

## Left out

- Placing, moving or buying decor (the owner said no).
- Decor that changes the rating (the owner chose not to).
- More than two floors, mezzanines and cutaway views of both floors at once.
- Staff as people; kinds of passenger and their reviews (bundle 4).
- An isometric view.
- Spotters as passengers with trips.
- Seasons.
