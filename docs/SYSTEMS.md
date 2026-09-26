# How the game works

The project notes (`CLAUDE.md`) hold what every change needs. This holds how each system works: read the section for the system you are changing, not the whole file. Keep it true: a PR that changes how something works updates its section here in the same PR.

## Checks

`npm run check` runs these groups; `npm run check -- <group>` runs one:
- `sim`: the headless sim;
- `saves`: every save in `tools/saves` loading and playing;
- `layout`: layout from 320 to 2560 px, portrait and landscape;
- `sheet`: phone sheet dragging with touch, and the full-screen drawer;
- `tour`: the guided start;
- `rules`: the same seed plays the same game, cheaper fares fill more seats and keep more travellers from Lowmere, costs rise with level, planes lose value with wear, levels ask for more each time, plan and goal ids are sound, and loading a save twice changes nothing;
- `transport`: the transport manager's suggestions are buildable, pay back within a week and come one per line; Not now hides one; extensions and upgrades work (the old line runs until the new one opens, which takes a reserved number); the manager leaves lines you've taken over alone, reviews the rest, adds services to an overfull line within the hour and runs event extras only while crowds travel;
- `shots`: phone, tablet and desktop screenshots of the airport, world and region in `build/shots/`. CI keeps them as the "screenshots" artifact on every PR;
- `share`: the link-preview tags are filled in, and the preview image (1200×630, under 300 KB) and home-screen icon are published;
- `layouts`: every layout plays two hours fully built without errors, the Layout tab fits a 320 px phone, and each layout's screenshot goes in `build/shots/`;
- `news`: What's new opens once for an older save and not again, never for a new game, and from Settings with every version;
- each file in `tools/checks/` is a group named after it (`terminal`: every layout's desks, lanes, passport desks, carousels and queues sit in their halls, and departing and arriving passengers each go through their own halls). It exports a function that gets the helpers (`open`, `ok`, `saveText`…);
- `perf`: how long a level 9 airport, and a fully built sixteen-stand Midfield, take to simulate, against a calibration run so machines compare (fails over its budget), and how close a CPU-throttled phone gets to full speed at 8× with each (reported only).

## The bot

For economy or progression changes, run the bot on seeds 1, 2 and 3: `npm run bot -- 1150 --seed 2` (the default seed is 1). Each run takes 3–4 minutes, so run them in the background, side by side: `nohup npm run bot -- 1150 --seed 2 > build/bot-2.log 2>&1 &`. The last lines are `SEED`, `LVLAT {level: game hour}`, `STATE` (a fingerprint of the whole game state at the end), `ERR [...]` and a table against `tools/baseline.json`. The same seed and code always give the same run, so run the same seeds before and after a change to see its effect. A change meant to leave the game as it is, such as a speed-up or a refactor, must leave `STATE` identical on seeds 1–3; compare against a build of `main` (`git worktree add`). The bot keeps the Classic layout unless you pass `'{"layouts":true}'`, which makes it approve layout plans and rebuild (Remote apron, then Satellite, then Starfish). `'{"recs":true}'` makes it also take the transport manager's best suggestion every six hours when it can afford it three times over, to show the suggestions pay (reported only). The "Balance" workflow runs seeds 1–3 both ways on PRs that touch `src/game/` or the bot, and puts the tables in the run's summary.

## Link previews

When the link is shared, chat apps and social sites show `src/public/preview.jpg` with the title and description from the tags at the top of `src/shell.html`. The build fills in the published address (`SITE_URL` from the Pages workflow, else `homepage` in `package.json`), inlines `icon.svg` as the tab icon and copies `src/public/` next to the page. After a change to how the game looks, run `npm run preview` to remake the image and the home-screen icon from the newest save, look at them, and commit them.

## UI

- Panels are HTML strings built by `renderPanel()`. Clicks are handled in one delegated listener through `data-*` attributes (also `recsClick`, `routesClick` and the region click).
- Sub-tabs use `segs()`. The Office has Plan, Money, Reports, Records, Policies and Settings.
- Tab ids are `stands` (Gates), `routes`, `terminal`, `ground` (Airfield), `sales`, `region` and `office`.

## Views and phone layout

- **Views:** `R.view` is `airport`, `region` or `world`, and `setView` switches between them.
- **Keyboard:** Space pauses, R opens the region, W the world, P the Masterplan, F full screen and H help.
- **Portrait phones:** the panel is a bottom sheet (`#side`) that is dragged by `#grip`.
  - While dragging, the sheet slides over the map using a negative `marginTop`, and `resize()` keeps the zoom. It snaps to 0/1/2 using `sheetMax()`.
  - In full screen, the sheet becomes a drawer opened with the Manage button.
- **Landscape phones** (height ≤ 500) show the map and panel side by side, with the board hidden.
- **Camera band:** `--gapsz` is set from the player's choice. It becomes `--topgap` in portrait and `--sidegap` in landscape.

## Gating and settings

- **Gating:** `has('kind:id')` (for example `up:desks`, `ac:3`, `rt:2`, `mode:hsr`, `feat:slots`) comes from approved Masterplan plans (`TECH`, 60 plans in 6 branches; the sixth is Layouts). Level unlocks come from `LEVELS`, which has 10 levels from Airfield to Airport of the Year.
- **Settings** live in `G.set`, read through `SET()`:
  - notifications: `tips`, `msgs`, `pops`, `goal`, `recs`, `badges`;
  - managers: `autoLines`, `autoFares`, `autoCrews`;
  - weekly challenges: `chal`.
  - Toasts follow `msgs` unless they reply to a tap in the last 900 ms. Floaters follow `pops`.

## Systems

- **Levels and Masterplan.** Level-ups and some goals give plan points. Consultants sell points from level 4. `GOALS` is a sequential list, and `curGoal()` returns the first goal that is unfinished and available.
- **Routes.**
  - Each city has a market in seats per day (`cityMarket`, which includes Lowmere's cut through `rivKeep`).
  - `routeLF` gives how full a flight will be.
  - The dispatcher `pickRoute` sends each plane where it earns most per hour.
  - Fares are −20%, standard or +25% per route.
- **Region.** Bus, tram, rail, metro and high-speed lines, development sites, events, and weather.
- **Transport manager** (`32-managers.js`, on with `autoLines`, for lines without `L.man`).
  - **What a change is worth:** `evalRegion` runs the region model with a change and without it, at 09:00 and 17:30. `recValue` adds transport profit, the airport's extra demand (valued by `airWorth`, the median recent hour) and cheaper wages.
  - **Reviews:** `managersTick` queues a review of each line every 6 hours. `mgrStep` then makes one measurement a game minute:
    - first the line as it runs, pinned to that moment (`evalFix`: the same weather and flyers for every option);
    - then a step more or fewer services, and on every other review a cheaper or dearer fare and meeting flights;
    - it makes the best change if it's worth at least $5/h and 3% of the line's running cost.
  - **Overfull lines:** `mgrHour` adds services to a line over 105% full, within the shared-track limit (`trackRoom`).
  - **Event extras:** `evExtra` has `lineFreq` run lines to a venue two steps more often while event crowds travel.
  - **Log:** its last three changes go in `R.mgrLog`.
  - **Suggestions** (with Settings › Recommendations):
    - `recCands` lists new lines, upgrades (`UPGRADE`, `upgradeStops`), one-station extensions, closures, and station and network upgrades;
    - `recJob` measures them a slice at a time between frames, all pinned to the moment it started (`computeTransitRecs` does all at once for the bot and checks);
    - they show quickest payback first, at most one per line and within a week (`REC_PAY`);
    - `applyRec` carries one out, and Not now hides one for a day (`R.recHide`).
  - **Upgrades** are line builds with `up` (and `from`, the old code): the old line runs until the build finishes, then takes the new kind, number (reserved by `nextNum`) and colour.
- **Lowmere.**
  - Lowmere opens 3 days after you reach City Airport. Your share of a shared route comes from `rivShare`: flights a day, fare, rating, on-time rate, plus promotions, slot agreements and high-speed rail.
  - It grows daily, runs 3-day fare sales and withdraws from routes you dominate.
  - You can buy it at World Gateway (`rivBuyCost`), after which it pays a daily dividend.
- **Airline operations.**
  - A departure of your own plane waits for a rested crew (`crewReady`; a duty of about 10 h, then 12 h of rest), and shows CREW DELAY while it waits.
  - `farDelay` can bring a plane back late.
  - The Maintenance policy (on by default) services worn planes at 03:00.
- **Records, stamps and challenges.**
  - Personal bests (`G.rec`) show a RECORD floater when broken.
  - There are 24 stamps; only earned ones are shown.
  - Each game week has 3 challenges, sized from last week. Each pays about 12% of a day's profit, and finishing all three gives a plan point while plans remain.
- **Airport layouts.** `LAYOUTS` in `39-layouts.js` lists each layout's stands (x, how far back the plane sits `dy`, gate name, price, level, `pier` for the second phase, `kind:'remote'` for bus stands), its buying `order` and its shop units. `applyLayout` copies the current one into `STAND_X`, `STAND_DY`, `STAND`, `GATES`, `SIDX`, `STAND_ORDER`, `SHOP_X` and friends in place, so code that reads those follows the layout.
  - **Every layout is 2D** and has `rooms` (convex floors), `doors` (`[roomA, roomB, x, y, half-width]`), `top` (how far up the runway moves) and `decor`. Their stands have a face point `x`,`y` and a heading `h` (where the nose points, degrees clockwise from north) and park nose-in; shop units add `y`, an angle and a room.
    - Helpers build the shapes: `CLP` (Classic's parts, shared with the Remote apron and Staggered apron), `pierParts` (a pier from a wall, with stands on either side and a wider head for a stand at its tip), `arcParts` (a curved concourse, one segment per stand).
    - A stand's `lean` (herringbone) turns its plane and `back` sets it back from the wall, while its bridge root and lounge stay square to the wall (the face frame, `faceW`).
    - `links` join rooms by train or by a tunnel with moving walkways: `[roomA, roomB, [x,y] station in A, [x,y] station in B, 'train' or 'walkway']`. Riders wait for the next train (every `TRAIN_EVERY` minutes) and are drawn as its car.
    - A 2D remote stand has a bus `gate` (`[x, y, 1 or -1 for the lounge below or above it]`) in its room and a bus `road` out to the plane.
    - Each stand's information card goes to the first clear spot around its plane (`placeBadges`).
  - **Stand frames.** Each stand's frame (`XF[i]`) turns plane-local coordinates (x across, y along with the nose up, as `geom()` lays them out) into the world: use `toW(i,x,y)`, `wx`/`wy`, and `standCtx(i)` to draw in it. Keep words upright: draw text at `toW` positions, not inside `standCtx`.
  - **Rooms.** Passengers walk straight within a room; `route(p,room)` lists the doorways and links to their target's room (the quickest trip, worked out once per layout) and `walk()` follows them.
  - Layouts unlock as Masterplan plans (`has('lay:<id>')`) and are rebuilt as a construction job `layout:<id>`. The switch happens at the first 03:00 after it's built (`G.layoutNext`, `G.layoutAt`), once stands it drops have seen off their last flight; kept stands move with their planes and passengers, and what doesn't fit is sold.
  - Effects come from what the game already simulates: positions and distances, stand and shop counts, `walk` (moving walkways) and `mover` (people mover) speed-ups, hall shops' extra pull, remote stands' buses (loads of 40 every 5 minutes, slower in rain, short-haul planes only, a small rating cost; `G.lounges`, the mobile lounges bought from the Remote apron's card, take the weather, the wait and the rating cost away), trains and tunnels, and `upk` running costs.
  - The `rules` check keeps every layout sound: names, buying order, wings, lounges and shops for straight-line layouts, and `layoutFaults` for 2D ones (planes touching planes or buildings, lounges and shops outside their rooms, doorways, convex and reachable rooms, gate cards covering planes). Classic is every save's default.
- **What's new.** `UPDATES` holds every version's headline and points. The card opens after loading when `G.seen` is older than the newest version (not for new games or during the guided start) and from Settings or Help. Each release adds an entry; the `rules` check matches it against `docs/HISTORY.md`.
- **Guided start.** A 6-step tour (`TOUR`) runs on new games only and can be skipped or replayed from Help. It turns itself off on any save with progress.
- **Saves across devices.** These only work on claude.ai, through `window.claude.use('db')`. On GitHub Pages `window.claude` is undefined, so the game saves on the device only. Keep that fallback working.
