# How the game works

The project notes (`CLAUDE.md`) hold what every change needs. This file holds how the code is laid out, how it's tested, and the rules shared by every system; each system has its own file in `docs/systems/`. Read the file for the system you're changing, not all of them (`node tools/graph.mjs <name>` finds it). Keep it true: a PR that changes how something works updates that system's file in the same PR, and a new system adds its own file there. The lists below between `joined` markers are built by `node tools/join.mjs` (`npm run build` runs it), so never edit them by hand.

## Systems

<!-- joined:systems from docs/systems/ by tools/join.mjs: don't edit between these lines -->
- [Airline operations](systems/airline-operations.md) (`34-airline-operations.js`)
- [Airport layouts](systems/airport-layouts.md) (`39-layouts.js`, `12-drawing.js`)
- [The airport scene](systems/airport-scene.md) (`50-scene.js`, `51-markings.js`, `55-vehicles.js`, `12-drawing.js`, `62-photo-mode.js`, `54-weather.js`, `52-planes.js`, `53-roofs.js`, `13-camera.js`, `08-stands.js`, `04-geometry.js`, `29-region-map.js`)
- [Clocks and day stats](systems/clocks.md) (`02-clocks.js`, `08-stands.js`, `34-airline-operations.js`, `45-baggage.js`)
- [Effects: the rating and money ledger](systems/effects.md) (`04-effects.js`, `15-panel.js`)
- [Guided start](systems/guided-start.md) (`36-guided-start.js`)
- [Level-up card](systems/level-up-card.md) (`49-levelup.js`)
- [Levels and Masterplan](systems/levels-and-masterplan.md) (`02-masterplan.js`, `09-construction-levels-days.js`, `18-masterplan-ui.js`)
- [Lowmere](systems/lowmere.md) (`33-lowmere.js`)
- [Photo mode](systems/photo-mode.md) (`62-photo-mode.js`, `12-drawing.js`, `50-scene.js`, `54-weather.js`, `29-region-map.js`)
- [Records, stamps and challenges](systems/records.md) (`35-records.js`)
- [Region](systems/region.md) (`24-region-places.js`, `30-region-ui.js`, `29-region-map.js`, `28-region-weather.js`)
- [Routes](systems/routes.md) (`31-routes.js`, `03-state.js`)
- [Saves](systems/saves.md) (`22-save.js`, `03-state.js`)
- [Sound](systems/sound.md) (`06-sound.js`, `48-sound.js`, `23-boot.js`)
- [The terminal](systems/terminal.md) (`42-terminal.js`, `47-hotel.js`, `05-flights.js`, `43-departures.js`)
- [Transport manager](systems/transport-manager.md) (`32-managers.js`)
- [Update check](systems/update-check.md) (`37-update-check.js`)
- [Weather and events](systems/weather.md) (`28-region-weather.js`, `10-events-toasts.js`, `54-weather.js`, `41-airside.js`, `07-passengers.js`, `12-drawing.js`, `39-layouts.js`, `43-departures.js`, `47-hotel.js`, `04-geometry.js`)
- [What's new](systems/whats-new.md) (`38-updates.js`)
<!-- /joined:systems -->

## Files

The game is one strict IIFE, split into files in `src/game/`. The build joins them in file-name order, so they share one scope: any file can use what another declares at the top level, and order only matters for code that runs at load time (`99-start.js` runs last and starts the game). Keep a new system in its own file, numbered before `99-start.js`, and start it with a one-line `/* ===== what's in it ===== */` comment: the table below is built from those lines. Some functions sit where they were first written rather than where their name suggests (`wageBill` is in `10-events-toasts.js`), so search `src/game/` by name.

The main names, by file group (the joined table below is the complete list, from each file's first line):

| Files | What's in them |
| --- | --- |
| `00-random` | `rnd()`, the seeded random generator the simulation uses |
| `01-constants` to `03-state` | Constants and level data, the clock tables and day stats (`02-clocks`), the Masterplan (`TECH`), state (`G`, `R`, `DEFAULT`) |
| `04-effects` | The effects ledger: `effect(kind, cause, amount, at)` behind `repAdj`, `earn` and `spend`, the rating's causes (`REPWHY`, `REPLBL`, `repRecent`) and floaters |
| `04-geometry` | Airport geometry |
| `05-flights` to `11-main-update` | Flights, sound, passengers, stands, construction/levels/days, events and toasts, `update()` |
| `12-drawing` to `14-board` | Drawing the airport, the camera, the departures board |
| `15-panel` to `21-layout` | Side panel, advisor, help/keys/speed, Masterplan UI, phone bottom sheet, full screen, layout |
| `22-save`, `23-boot` | Saving and migrating (`resetAll`), boot and the frame loop |
| `24-region-places` to `30-region-ui` | The region: places and stations, helpers, the journey network, events and line building, weather, map drawing, the Region tab |
| `31-routes` to `36-guided-start` | Routes, their demand and fares, the dispatcher (`pickRoute`) and the world map, managers and recommendations, Lowmere, airline operations, records/stamps/challenges, guided start |
| `37-update-check` | Tells a player on the published site when a new version is ready, and reloads to it |
| `38-updates` | What's new: the `UPDATES` list (every version, newest first) and its card |
| `39-layouts`, `40-layout-drawing` | Airport layouts: the `LAYOUTS` table, rebuilding and switching, the Airfield › Layout tab; remote stands, buses, rooms, shop units and each layout's buildings |
| `41-airside` | Stand frames (`XF`, `toW`, `toL`), airside rooms and doorways (`route`, `walk`), and `layoutFaults`, the fit check for 2D layouts |
| `42-terminal` to `47-hotel` | The terminal: its halls and the tables the parts plug into, then departures (check-in, security), arrivals (immigration, reclaim, the way out), baggage, the market place (shops, the walk to the gate) and the hotel |
| `48-sound` | Announcements for your flights, spoken calls and ambience, watched from the frame loop (`soundTick`); the tones are in `06-sound` |
| `49-levelup` | The level-up card: what a new level has just unlocked, with links there |
| `50-scene` | The airport view's drawing layers (`LAYER`), the frame's view `V` and the lighting pass (`LIGHTS`, `lamp`) |
| `51-markings` | Apron, stand and runway markings, and the airfield's lights at night (`rwyMarks`, `grade`) |
| `52-planes` | Planes on the stands and runway: engines, shadows, airline colours and their lights (`drawPlane`, `miniPlane`) |
| `53-roofs` | Roofs over the built halls, shown when the player picks the roof floor (`R.floor`, `setFloor`, `roofNow`) |
| `54-weather` | Rain, puddles, settled snow, fog, cloud shadows and the windsock, read from `R.fx` (through `drawnFx()`, for photo mode) |
| `55-vehicles` | Fuel and catering trucks, baggage tractors and pushback tugs at each turnaround (`vehicleWork`) |
| `99-start` | The `/*SIM_HOOK*/` marker and the call that starts the game |

`src/shell.html` holds the CSS, the HTML skeleton and a `/*GAME*/` placeholder inside the only `<script>`.

<!-- joined:files from src/game/, each file's first line by tools/join.mjs: don't edit between these lines -->
| File | What's in it (its first line) |
| --- | --- |
| `00-random.js` | random |
| `01-constants.js` | constants |
| `02-clocks.js` | clocks |
| `02-masterplan.js` | the Masterplan: a tech tree bought with planning points |
| `03-state.js` | state |
| `04-effects.js` | effects |
| `04-geometry.js` | geometry |
| `05-flights.js` | flights |
| `06-sound.js` | sound |
| `07-passengers.js` | passengers: landside & airside |
| `08-stands.js` | stands |
| `09-construction-levels-days.js` | construction, levels, days |
| `10-events-toasts.js` | events & toasts |
| `11-main-update.js` | main update |
| `12-drawing.js` | drawing |
| `13-camera.js` | camera |
| `14-board.js` | board |
| `15-panel.js` | panel |
| `16-advisor.js` | advisor |
| `17-help-keys-speed.js` | help, keys, speed |
| `18-masterplan-ui.js` | Masterplan UI |
| `19-bottom-sheet.js` | bottom sheet (phones) |
| `20-full-screen.js` | full screen |
| `21-layout.js` | layout |
| `22-save.js` | save |
| `23-boot.js` | boot |
| `24-region-places.js` | REGION: transport, development and the wider world |
| `25-region-helpers.js` | geometry |
| `26-region-network.js` | the network model: whole journeys, with changes between lines |
| `27-region-events-lines.js` | events |
| `28-region-weather.js` | disruptions |
| `29-region-map.js` | region map drawing |
| `30-region-ui.js` | view switching, camera and taps |
| `31-routes.js` | ROUTES: the world map and your network of cities |
| `32-managers.js` | managers and recommendations: help for players who'd rather not tune everything |
| `33-lowmere.js` | LOWMERE: a rival airport that competes for travellers on the routes you both fly |
| `34-airline-operations.js` | AIRLINE OPERATIONS: crews on duty limits, overnight checks, delays at the far end |
| `35-records.js` | RECORDS, STAMPS AND WEEKLY CHALLENGES |
| `36-guided-start.js` | GUIDED FIRST HOUR: a ring on the real control, one line, and it waits for you |
| `37-update-check.js` | update check: tell players when a new version is ready |
| `38-updates.js` | WHAT'S NEW: every version's new features, shown after an update and from Settings or Help |
| `39-layouts.js` | LAYOUTS: the airport's stands, piers and shop units, and rebuilding into another layout |
| `40-layout-drawing.js` | LAYOUT DRAWING: remote stands and buses, rooms, shop units, links and each layout's furniture |
| `41-airside.js` | AIRSIDE: stands at any angle, rooms joined by doorways, and walking between them |
| `42-terminal.js` | the terminal: halls in the order real airports use them, the same in every layout |
| `43-departures.js` | departures: check-in and security |
| `44-arrivals.js` | arrivals: immigration, reclaim, customs and the way out |
| `45-baggage.js` | baggage: from the check-in belt to the hold, and from the plane to the carousel |
| `46-market.js` | the market place: shops with people inside, gate calls, seats, and passengers' time airside |
| `47-hotel.js` | the airport hotel |
| `48-sound.js` | sound: announcements for your flights, and ambience that follows the camera |
| `49-levelup.js` | the level-up card: what a new level has just unlocked, with links straight there |
| `50-scene.js` | SCENE: the airport view's drawing layers and its lighting pass |
| `51-markings.js` | MARKINGS: paint on the apron, the runway's markings, and the airfield's lights by night |
| `52-planes.js` | PLANES: the aircraft on the stands and the runway's small planes |
| `53-roofs.js` | ROOFS: the terminal and its piers seen from above, a floor the player steps up to |
| `54-weather.js` | WEATHER: rain, settled snow, puddles, fog banks, cloud shadows and a windsock |
| `55-vehicles.js` | VEHICLES: ground vehicles working each stand's turnaround |
| `62-photo-mode.js` | PHOTO MODE: hide the panels, pick a drawn time and sky, and save a picture |
| `99-start.js` | the `/*SIM_HOOK*/` marker and the call that starts the game |
<!-- /joined:files -->

## State

- **`G` and `R`.** `G` is the saved state (JSON in `localStorage['final-call-save-v2']`). `R` is runtime only.
- **New and old saves.** `FIELDS` (`03-state.js`) lists every saved field with its default; `DEFAULT()` builds a new game from it, and `resetAll(state)` gives an older save's missing fields the same defaults, then runs `MIGRATIONS` (`22-save.js`), an ordered list of `{when, up, note}`. When you add state, add its line to `FIELDS` (a terminal part uses `TERM_FIELDS`, the same table), and a step at the end of `MIGRATIONS` only if older saves need more than the default. Never rename or remove saved fields, because old saves must keep loading; the `migrate` check fails if any save in `tools/saves/` loads differently.
- **Saves stay on the device.** The only other localStorage key is `final-call-topgap`, the phone camera band. The old `final-call-cloud` and `final-call-device` keys are cleared on load.

## Time

`update(dt)` advances game minutes. The frame loop takes steps of up to 0.034 minutes, or 0.1 minutes at 4× and 8× (the bot's step size, a third of the work). These hooks run from it:
- The frame loop, four times a second and never in `R.sim`: the board, the goal bar, `soundTick` (which watches the game without changing it) and `lvlTick` (the level-up card).
- Everything else is a hook in the clock tables (`02-clocks.js`, [Clocks and day stats](systems/clocks.md)): `MINUTE` each game minute, `HOUR` on the hour and half hour, `NIGHT` at 03:00 and `DAY` when the day changes. Each is an ordered list of `{id, every, at, fn}`. The order is listed once, in `CLOCK_ORDER`, and a system registers its hooks from its own file with `clock(T, id, every, at, fn)`.
  - `MINUTE`: `autoStaff` (every 2 minutes), `updateBuilds`, `layoutTick`, `dayTick`, `checkLevel`, `fleetTick`, `managersTick` (every 6 hours), `mgrStep` and the terminal's `TERM_MINUTE` hooks.
  - `HOUR`: `mgrHour`, `crewTick` (every 30 minutes), `recordsHour`, `NIGHT` (`nightChecks`) and advertising's cost to the rating.
  - `DAY`: the day report, `recordsDay`, the new day, `regionDay`, `rivalDay`, `chalDay`, the terminal's `TERM_DAY` hooks and the season's toast.
- A day's stats are in `G.dstat`, whose fields are listed in `DAY_STATS`. Count with `dayAdd(key, n)` and read with `dayVal(stats, key)`.

## Headless sim

- `R.sim=true` means no DOM work and no saving, and toasts resolve to their last choice. Everything reachable from `update()` must work that way.
- **Randomness.** Anything that can change the game state uses `rnd()`, never `Math.random()`, so a seed repeats a run exactly. Only sound, the board's flaps, and weather drawing use `Math.random()`, and the build rejects it on any line that doesn't end with `// cosmetic`.
- **`window.__sim`.** Tests reach the game through it, in `build/test.html` only. `tools/build.mjs` builds it from what the tests use: every top-level name that `tools/*.mjs`, `tools/checks/*.mjs` or `tools/bot.js` reaches as `S.<name>` or `__sim.<name>` (with `S=__sim`), plus any throwaway script in `build/*.mjs`, so there's no list to add to. A top-level `let` gets a getter and a setter, so it stays live. The terminal's parts can still add to `SIMX` in their own files.

## Build

- `npm run build` builds `dist/index.html` and `build/test.html` (with `window.__sim`), writes `docs/graph.json`, and rejoins the joined lists (`tools/join.mjs`). It needs no dependencies. It fails, naming the file and line, on a syntax error, a top-level name declared twice, a `</script>` inside the game, duplicate top-level function names, a lost marker, or a top-level `let` that a part adds to `SIMX` without a getter.
- `node tools/where.mjs <line>` turns a line number from an error in `dist/index.html` or `build/test.html` into `src/game/<file>:<line>`.

## Checks

`npm install` once (web sessions do it at start-up through `.claude/hooks/session-start.sh`), then `npm run check`, about 1–2 minutes with Playwright and Chromium. `npm run check -- <group>` runs one group. Every page is seeded, so a failure repeats. When you change a rule on purpose, update its check in the same PR; add a check when you add a rule.

- **A group is a file.** Each file in `tools/checks/` is a group named after it. It exports a default async function that gets the helpers from `tools/check.mjs` (`open`, `ok`, `saveText`, `saves`, `newest`, `browser`, `root`, `out`, `url`, `HIST_TOP`) and reports through `ok(name, pass, info)`. Its opening comment says what it covers, and the list below is built from those comments: add a group by adding a file.
- **Pending checks** (`tools/checks/pending.txt`). A check written before the code it tests is listed there by its full name (or `group: *`), with a comment naming the part that switches it on. While it fails it prints `PEND` and doesn't fail the run; once it passes it prints `FAIL … pending, but passes` until its line comes out, so a vacuous check is caught and each part takes out its own lines in its PR. A group that throws reports one line for itself (`group: *`), and a full run fails on a listed name that no check reports. The summary counts them (`N pending`). Only a checks-first PR and the coordinator add lines. Checks whose play takes seconds (every layout for two hours, every old save in a fresh page, the terrace's afternoon) wait until the code they test exists; `TP_ALL=1 npm run check -- <group>` plays them anyway.
- **Playwright** is pinned to 1.56.1, whose Chromium (build 1194) the web image already has. If Chromium is missing, run `npx playwright install chromium`, or set `CHROMIUM_PATH` to an existing Chromium binary. Change the pin only together with the lock file. CI caches `~/.cache/ms-playwright`, keyed on this pin, across `checks.yml`, `balance.yml`, `parts.yml` and `health.yml`; a version bump pays for one cache miss, then hits again.
- **Looking at UI changes.** `npm run check -- shots` covers the three main views; for anything else, write a small Playwright script in `build/` (git-ignored) that opens `build/test.html` at phone (390×844, `hasTouch`, `isMobile`), tablet (768×1024) and desktop (1440×900) sizes, then screenshots it and reads the images.
- **Saves for testing.** Seed a save through `localStorage['final-call-save-v2']` in an init script, and the random seed through `window.__seed`. `tools/saves/*.json` and `build/saves/L<n>.json` (written by the bot) are ready-made airports at each level. `tools/saves/` keeps saves from every version that changed what gets saved (`v<version>-L<level>.json`); when a release adds saved fields, it adds saves made with it (the `release` playbook).

<!-- joined:checks from tools/checks/, each file's opening comment by tools/join.mjs: don't edit between these lines -->
- `arrivals`: Arrivals (docs/specs/terminal.md): passengers off domestic flights walk straight past immigration and everyone else goes through it; e-gates take only e-gate passports; about 1 in 40 is checked at customs; everyone who lands ends up out, at a stop or the station, or at the hotel; and nobody arriving walks into a departures hall.
- `baggage`: The baggage system (src/game/45-baggage.js): every checked bag ends in a hold or is left behind and counted, every arriving bag reaches its carousel, an overloaded sorter backs up, a tight transfer can miss, and early bags wait in the store.
- `brief`: docs/briefs/TEMPLATE.md and every session brief in docs/briefs/ have all their sections, filled in (tools/brief.mjs).
- `clocks`: The clocks (02-clocks.js, docs/SYSTEMS.md "Time"): over a seeded day and a bit, the hooks run in the same order and at the same cadence as they did on main before the tables (tools/checks/lib/clocks.json, recorded from main with a log call at each hook), and every hook the order lists is registered once, from its system's own file.
- `daystats`: A day's stats (DAY_STATS in 09-construction-levels-days.js, docs/SYSTEMS.md "Time"): over two seeded days at a level 9 airport, the day report (G.lastDay) has the fields it had on main (tools/checks/lib/daystats.json, recorded there; DAYSTATS_RECORD=1 writes it again after a change that moves the dice on purpose, such as #101's rating), every field G.dstat gets is in DAY_STATS, and a new day starts with the fields DAY_STATS resets.
- `decor`: Decor and local character (docs/specs/terminal-place.md): decor comes with the building, more with each level, is never placed or saved, never stands in anyone's way, and local signs take the region's place names and fit their halls. Written before the code (tools/checks/pending.txt). Reads the names in lib/place.mjs, plus decor() → [{hall, kind, x0, y0, x1, y1}…], the items for the layout as built and the level, and localNames() → [{text, place, hall, w}…], the local signs (place: a key of PLACES; w: the text's width in world units). "Never in the way" also reads where the counters are: deskX, kioskX, laneX, qSlot, secSlot, ftSlot, egSlot, and boothPos, egatePos, carX, carY and arrSlot, which the decor part adds to SIMX.
- `departures`: Departures (docs/specs/terminal.md): check-in islands with their own queues, bag drop for kiosk and online passengers with bags, and security: the search rate, family and assistance lanes, and no way into the market place but a lane.
- `effects`: The effects ledger (04-effects.js, docs/SYSTEMS.md): every cause the rating moves for over a day of play has a REPWHY entry (what the advisor says) and a REPLBL label (the Money tab's rating list); R.repWhy adds up to the change in the day's score the rating follows; and the airport's own rating events carry the stand they happened at.
- `feedback`: The feedback link in Help (docs/specs/feedback-link.md): hidden outside GitHub Pages; on GitHub Pages it opens a prefilled issue for the repo the page is served from, and the body stays well under GitHub's URL length limit.
- `floors`: Two floors (docs/specs/terminal-place.md): departures upstairs and arrivals below, people changing floor only on the escalators and the lift (families and those who need help by lift), nobody stuck, walks about as long as before, taps going to a hall's floor, and old saves landing on the right floor. Written before the code (tools/checks/pending.txt). Reads the names in lib/place.mjs, plus a baggage hall room 'bag', hallLabel(id) → [x, y] where a hall's name is drawn, and an advisor tip {hall: id} flying the camera to that hall.
- `graph`: The map in tools/graph.mjs: every link in the docs resolves, every system in docs/systems/ names its files, and the joined lists (tools/join.mjs) are sound; a system's file changed without its notes is a warning, and so are notes naming three or more functions that live in one file outside the system's own (a file its first line mentions only after a ";" isn't its own).
- `hotel`: The airport hotel (docs/specs/terminal.md): it's never overbooked, crews resting there are ready sooner, stranded passengers get rooms, late arrivals walk through to the lobby, early guests come down from it, and with no hotel nothing changes.
- `kofi`: The Ko-fi link (docs/specs/kofi-link.md): a quiet link to https://ko-fi.com/kylemck in What's new, Settings and the level-up card, nowhere else (not the airport view, the board or the goal bar), and it doesn't stop the level-up card fitting a 320 px phone.
- `layout`: No sideways overflow and no page scroll, from 320 px phones to 2560 px screens, portrait and landscape.
- `layouts`: Every airport layout plays two hours fully built without errors, its Layout tab fits a 320 px phone, and a desktop screenshot of each goes in build/shots/.
- `levelup`: The level-up card (docs/specs/level-up.md): it opens once on a level-up, pauses the game and puts the speed back; it lists only what has just unlocked; each link lands on the right tab; two levels at once make one card; the setting, the guided start and the headless sim keep it closed; and it fits phones, tablets and desktops.
- `market`: The market place (docs/specs/terminal.md): shops hold no more than their room, passengers go to their gate only once the board calls it, late calls mean more shopping and early ones less, passengers stand only when a lounge's seats are full, families use the play area, and with a walk-through duty free everyone out of security walks through it.
- `markings`: Apron markings and lighting (src/game/51-markings.js, docs/specs/real-airport.md): markings on built stands only, on every layout; lights only at night, and runway lights only on open runways; the dawn and dusk colour grade; and the markings leave the canvas as they found it.
- `masterplan`: The Masterplan overlay (issue #73, polish audit rows 6-7): opening it on a small phone keeps the header and buy-point button in view, and one plan per category is marked as the recommended next pick, worded like the level-up card's "what this unlocks" line. The recommendation is display only.
- `migrate`: Loading saves (22-save.js): every save in tools/saves loads to exactly the airport it did when its hash below was recorded, and every field of a new game has its default in FIELDS. Each save is loaded headless with the same seed; the hash is of JSON.stringify(G) with savedAt zeroed (wall-clock time) and G's own keys sorted, since the order of G's top-level keys is not game state (nothing walks them) while the order inside each field is. A new fixture fails until its line is added to GOLD: the check prints the hash to add.
- `movement`: How passengers are seen to move (07-passengers.js walkMul, 41-airside.js walk, 12-drawing.js paxEase and drawMover): over a seeded half hour at the 1× frame step, nobody drawn walking moves faster than a walking top speed, and no one's drawn speed jumps by more than a set factor from one step to the next. The only exceptions are named, drawn changes: boarding a train, the people mover or a bus (hidden, drawn as it), appearing again (drawn where they are), and stepping onto a walkway link (drawn), where the pace doubles. Run on Classic with the people mover, and on layouts with walkway links (Round) and trains (Satellite). Speeds are in px per game minute: the top is the moving walkways upgrade's best pace (80×2.6×1.35) and a little to catch up; a walkway link doubles it, and a layout built for connections (LAY.xfer) speeds connecting passengers, drawn ringed.
- `news`: What's new opens once for an older save and not again, never for a new game, and from Settings with every version. It waits for the page's state (R.newsBoot), not set times.
- `noise`: Less noise (polish audit rows 11, 15, 16, 27): repeated region incidents fold into one Reports line; a full stack of choice toasts still resolves the one the cap evicts, and informational toasts expire on their own; the advisor's tip clears off the airport view and returns on it; a young save's What's new folds older versions away. Row 29 (the update-checker's fetch) is confirmed by reading the source: it's already wrapped in try/catch, so nothing here exercises it.
- `perf`: How long a level 9 airport, and a fully built sixteen-stand Midfield, take to simulate, against a calibration run so machines compare (fails over its budget), and how close a CPU-throttled phone gets to full speed at 8x with each (reported only).
- `photo-mode`: Photo mode (src/game/62-photo-mode.js, docs/specs/photo-mode.md): the camera button hides every panel, chip, toast and the phone chrome at every screen size and leaves the map and the photo bar; every drawn time and sky draws, in the airport view and the Region; the shutter makes a PNG the size of the canvas; Done, Esc and a tap leave and bring the panels back; and none of it changes G, R.fx or the random stream.
- `plans`: "The terminal as a place" (docs/specs/terminal-place.md): each layout's own terminal table, floors on rooms and doorways, the floor chip, each layout's floor plan, and the scene checks the bundle adds (nothing drawn inside a hall under the roof, one floor at a time, and how fast the terminal draws zoomed in). Written before the code: tools/checks/pending.txt lists the checks still waiting for it. The names they read are in lib/place.mjs, plus hallLabel(id) → [x, y], where a hall's name is drawn (tapping it goes to that hall's floor).
- `rating-day`: A rating that reflects the last day (04-effects.js, docs/systems/effects.md): on by default, it moves over a seeded day with fog and storms in the morning, stays inside its 5–100 floor and cap, and saves from every version still load; window.__rateDay=false (never saved) still plays the old running sum, for comparing.
- `rebuild`: Rebuilding twice (bug #78, src/game/39-layouts.js): switching layouts back to back with a busy airport never throws or loses anyone. A flight at a stand the new layout drops moves to a free built stand with everyone who belongs to it; with no stand free, the switch waits for those stands to empty, as a rebuild does.
- `region-looks`: The region map's look (29-region-map.js, docs/systems/region.md): drawing it at level 3, 5 and 9, by day, dusk and night, zoomed out and in, in rain and fog, changes nothing in G and throws nothing; the land is painted to its cache once, not every frame; the labels stay inside the view on a 320 px phone; and how long a frame of the level 9 region takes to draw on a desktop, against a calibration run (so machines compare).
- `reports`: Reports and the region at night (docs/briefs/polish-reports.md, #76): Office › Reports folds routes with no flights behind a link and shows near-zero profit in whole dollars; Region › Transport names the busiest lines and says when a quicker line takes a line's riders; and the region map darkens at night while its towns' windows shine.
- `roofs`: Roofs over the terminal and its piers (src/game/53-roofs.js, docs/specs/real-airport.md): a floor the player steps up to with the Roof button, never drawn over the halls on their own at any zoom, never over a room not built yet, and taps still reach the shops under them and the stands.
- `rules`: The game's rules: the same seed plays the same game; cheaper fares fill more seats and keep more travellers from Lowmere; costs rise with level; planes lose value with wear; levels ask for more each time; every layout is sound; plan and goal ids are sound; the newest What's new version matches docs/HISTORY.md; the sim hook reads live values; and loading a save twice changes nothing.
- `saves`: Every save in tools/saves loads, plays two game days and opens every tab.
- `scene`: The airport view's drawing layers and lighting pass (src/game/50-scene.js, docs/specs/real-airport.md): every layer draws once a frame, in order, and only in the airport view; the lighting pass darkens the apron at night and adds its lights; drawing never changes the game; and how long a frame takes to draw, against a calibration run (so machines compare) and the speed budget the real airport's parts share.
- `share`: The link preview: the tags are filled in, and the preview image (1200x630, under 300 KB) and the home-screen icon are published.
- `sheet`: On a phone the bottom panel drags up and down with touch and snaps, the page never scrolls, and in full screen it becomes a drawer.
- `shots`: Phone, tablet and desktop screenshots of the airport, world and region, in build/shots/ (CI keeps them as the "screenshots" artifact on every PR).
- `sim`: The headless sim: a new game plays 72 game hours with R.sim on, without errors.
- `sound`: Sound (docs/specs/sound.md), with a stub audio context and speech synthesis that count what plays: your flights' boarding, gate calls and final calls each announce once, never a partner's or a freighter's; spoken calls are rare, only final calls and gate changes, and none at 4x; each setting silences its own part and the master switch all of them; nothing happens in the headless sim; nights are quiet; and the board's line fits a 320 px phone.
- `terminal`: The terminal's halls (docs/specs/terminal.md): every layout's desks, lanes, passport desks, carousels and queues sit in their halls, and passengers really go through them: departing ones from the forecourt through check-in and security into the market place, arriving ones from the concourse through immigration, reclaim and customs, and out.
- `terrace`: The roof terrace and its spotters (docs/specs/terminal-place.md): a Terminal upgrade from level 3, hidden before; seen on the roof at every zoom; a crowd for something rare and nothing else to say so; fewer at night and in rain; never in the terminal's queues; small takings; its card fits a phone. Written before the code (tools/checks/pending.txt). Reads the names in lib/place.mjs, plus UPG.terrace and G.lv.terrace, R.spot (how many spotters are up there), R.spotDrawn (how many the last frame drew), terraceBox() → [x0, y0, x1, y1], its takings earned as 'terrace' (G.revBy.terrace), and its card, #terrace, under Terminal › Staff.
- `topbar`: The top bar (help, pause, speeds, the views, full screen, sound) keeps every button on one row, at touch size on phones, in portrait down to 320 px, in landscape, and on tablet and desktop, in the airport view and the Region, with and without full screen.
- `tour`: A new game starts the guided first hour, and it advances.
- `transport`: The transport manager: its suggestions are buildable, pay back within a week and come one per line; Not now hides one; extensions and upgrades work (the old line runs until the new one opens, which takes a reserved number); it leaves lines you've taken over alone, reviews the rest, adds services to an overfull line within the hour and runs event extras only while crowds travel.
- `update`: The update-check toast (docs/specs/update-toast.md, src/game/37-update-check.js): quiet when the running build matches dist/version.json, a toast when it doesn't, Update now saves then reloads, Later holds it back an hour, and none of it runs off GitHub Pages or in the headless sim.
- `vehicles`: Vehicles working each stand's turnaround (src/game/55-vehicles.js, docs/specs/real-airport.md): vehicleWork(i) reads only the stand's own state, so it's a turnaround (docked, or easing back off the stand) exactly when the stand says so, and never at an empty stand or one whose plane is still on its way in.
- `weather-fx`: Weather and events in one place (28-region-weather.js, docs/systems/weather.md): over a seeded day and a bit on the level 9 save, the weather and event flags in R.fx (fog, snow, rain, storm, rush, sick, strike, fuel, the lines' faults, replacement buses, roadworks and leaves) come on and go off at the same minutes as they did on main before weather.set and weather.on (tools/checks/lib/weather-fx.json, recorded from main; WEATHER_FX_RECORD=1 writes it again).
- `weather`: Weather you can see (src/game/54-weather.js, docs/specs/real-airport.md): rain, settled snow, puddles, fog and cloud shadows draw only while R.fx says they're on (fading out after, never a new saved field), settled snow is cleared from every built stand, and the windsock is always up.
- `windows`: Windows (docs/specs/terminal-place.md): glass on every airside wall that faces the apron, passengers who are waiting drifting to it when a wide-body goes by and never after their gate is called, and lit at night. Written before the code (tools/checks/pending.txt). Reads the names in lib/place.mjs, plus glass() → [[x1, y1, x2, y2]…], the glass for the layout as built; p.watch, set while a passenger watches; and glassLights, the function the windows add to LIGHTS.
<!-- /joined:checks -->

On a **draft** PR, the Checks workflow (`checks.yml`) only runs the groups `tools/touched.mjs` says the changed files touch, plus `brief` and `graph` (cheap) and `sim` (a floor); marking the PR ready for review, a non-draft PR, or a manual run all run every group instead. Only `src/game/` files, `tools/graph.mjs`, `tools/brief.mjs` and `tools/checks/*.mjs` map to a narrower set; anything else (`tools/build.mjs`, `src/shell.html`, `package*.json`, a workflow file, `tools/check.mjs`…) falls back to every group, same as a diff it fails to read.

## The bot

For economy or progression changes, run the bot on seeds 1, 2 and 3: `npm run bot -- 1150 --seed 2` (the default seed is 1). Each run takes 3–4 minutes, so run them in the background, side by side: `nohup npm run bot -- 1150 --seed 2 > build/bot-2.log 2>&1 &`. The last lines are `SEED`, `LVLAT {level: game hour}`, `STATE` (a fingerprint of the whole game state at the end), `PLAY` (the same without `G.set` and `G.seen`, which a release changes without changing play), `ERR [...]` and a table against `tools/baseline.json`. The same seed and code always give the same run, so run the same seeds before and after a change to see its effect. A change meant to leave the game as it is, such as a speed-up or a refactor, must leave `PLAY` identical on seeds 1–3 (and `STATE`, unless it adds a setting or a What's new entry); compare against a build of `main` (`git worktree add`). The bot keeps the Classic layout unless you pass `'{"layouts":true}'`, which makes it approve layout plans and rebuild (Remote apron, then Satellite, then Starfish). `'{"recs":true}'` makes it also take the transport manager's best suggestion every six hours when it can afford it three times over, to show the suggestions pay (reported only). The "Balance" workflow runs seeds 1–3 both ways on PRs that touch `src/game/` or the bot, once when the PR opens or leaves draft and again when the `balance` label is added, and puts the tables in the run's summary.
- The "Health check" workflow (`.github/workflows/health.yml`) runs `npm run check` and the bot on seeds 1–3, keeping Classic, against `main` weekly (Monday, early UTC) and on demand. `tools/health.mjs` reads each seed's `build/bot-<seed>.json` and recomputes its levels against `tools/baseline.json` (or, for a manual run only, a `baseline_override` input that tightens a range without touching the file, to prove the workflow catches drift), rather than parsing the bot's per-step output. When a check fails, the bot errors, or a level is `off` or never reached, it opens one issue labelled `health` with a table, the failing check groups and a link to the run, or updates the open one; a later clean run comments and closes it.

## Link previews

When the link is shared, chat apps and social sites show `src/public/preview.jpg` with the title and description from the tags at the top of `src/shell.html`. The build fills in the published address (`SITE_URL` from the Pages workflow, else `homepage` in `package.json`), inlines `icon.svg` as the tab icon and copies `src/public/` next to the page. After a change to how the game looks, run `npm run preview` to remake the image and the home-screen icon from the newest save, look at them, and commit them.

## UI

- Panels are HTML strings built by `renderPanel()`. Clicks are handled in one delegated listener through `data-*` attributes (also `recsClick`, `routesClick` and the region click).
- Sub-tabs use `segs()`. The Office has Progress (`progress`: level, plan, rating, goals and this week's challenges), Money, Reports, Records (records and stamps), Policies and Settings.
- Office › Settings has its own chips (`R.setSub`, `SET_SUBS`): Managers (the default), Alerts (notifications, What's new and weekly challenges), Screen and sound, and Save (airline name, livery, save code, reset).
- Terminal › Staff also shows the Staff pay policy card, the same `pol('pay')` as Office › Policies (`polRow`).
- Office › Reports' route table shows profit below $100 in whole dollars, and folds routes with no flights in the last 24 hours behind a Show/Hide link (`R.idleRoutes`, runtime only).
- Tab ids are `stands` (Gates), `routes`, `terminal`, `ground` (Airfield), `sales`, `region` and `office`.

## Views and phone layout

- **Views:** `R.view` is `airport`, `region` or `world`, and `setView` switches between them.
- **Keyboard:** Space pauses, R opens the region, W the world, P the Masterplan, F full screen and H help.
- **Portrait phones:** the panel is a bottom sheet (`#side`) that is dragged by `#grip`.
  - While dragging, the sheet slides over the map using a negative `marginTop`, and `resize()` keeps the zoom. It snaps to 0/1/2 using `sheetMax()`.
  - In full screen, the sheet becomes a drawer opened with the Manage button.
- **Landscape phones** (height ≤ 500) show the map and panel side by side, with the board hidden.
- **Camera band:** `--gapsz` is set from the player's choice. It becomes `--topgap` in portrait and `--sidegap` in landscape.
- **Top bar** (`.hud`): one row at every size (the `topbar` check). On touch screens its buttons are 42 px, and `.stage` is a size container (`stage`) so the bar steps down by the map's width, not the screen's:
  - under 560 px the four speeds fold into `#spdb`, which shows the speed and cycles 1×/2×/4×/8× (a tap on a paused game resumes it), and the buttons are 40 px;
  - under 356 px (a 320 px phone, or a phone on its side with the camera band) full screen, sound and photo mode leave the bar, and the help card has them instead (`#hscr`, `syncHscr()`, and its Photo mode link);
  - under 272 px the buttons narrow to 36 px.
  - A new top-bar button counts against these widths: move the steps and the check with it.

## Gating and settings

- **Gating:** `has('kind:id')` (for example `up:desks`, `ac:3`, `rt:2`, `mode:hsr`, `feat:slots`) comes from approved Masterplan plans (`TECH`, 62 plans in 6 branches; the sixth is Layouts). Level unlocks come from `LEVELS`, which has 10 levels from Airfield to Airport of the Year.
- **Settings** live in `G.set`, read through `SET()`:
  - notifications: `tips`, `msgs`, `pops`, `goal`, `recs`, `badges`, `lvlCard` (the level-up card);
  - managers: `autoLines`, `autoFares`, `autoCrews`, and `autoDuty` (the duty manager: hotel room prices);
  - weekly challenges: `chal`;
  - sound: `sndAnn` ('on', 'chime' or 'off'), `sndVoice`, `sndAmb`, `sndFx`, under the master switch `G.sound`.
  - Toasts follow `msgs` unless they reply to a tap in the last 900 ms. Floaters follow `pops`.
