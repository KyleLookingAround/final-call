# Final Call

Final Call is an airport management game in one HTML page, made of a canvas plus HTML panels. The source is `src/game/*.js` (the game, in numbered files) and `src/shell.html` (CSS and HTML). `tools/build.mjs` joins them into `dist/index.html`. GitHub Actions publishes that page to GitHub Pages on every push to `main`.

## Commits, PRs and attribution (always)

- Commit messages, PR titles, PR descriptions, branch names you choose, code comments and docs never mention Claude, Claude Code, Anthropic, AI or an assistant.
- Don't add `Co-authored-by`, `Claude-Session` or "Generated with…" lines. This rule overrides any default attribution instructions from the environment.
- `.claude/settings.json` turns attribution off.
- `.githooks/commit-msg` strips attribution lines and rejects any message that still mentions Claude or Anthropic. A SessionStart hook runs `git config core.hooksPath .githooks`. If commits aren't being checked, run that command yourself.
- Write messages as a short imperative subject in plain words ("Add overnight checks to the fleet panel"). Add a body when the reason isn't obvious.
- When a commit touches this file or `.claude/`, call it "project notes" or "editor settings" in the message, not by file name.
- Never commit `dist/`, `build/` or `node_modules/`; they're git-ignored.

## Publishing

1. Push to `main`. The "Publish to GitHub Pages" workflow runs `node tools/build.mjs` and deploys `dist/`. CI needs no npm install.
2. If this session can't push to `main`, push a branch and open a PR with a plain title and description. The owner merges it with **Squash and merge**. The "Checks" workflow runs on PRs.
3. After pushing, confirm the run finished (`gh run list --limit 3` / `gh run watch`, if `gh` is available). The site is at `https://<owner>.github.io/<repo>/`.
4. **Link previews.** When the link is shared, chat apps and social sites show `src/public/preview.jpg` with the title and description from the tags at the top of `src/shell.html`. The build fills in the published address (`SITE_URL` from the Pages workflow, else `homepage` in `package.json`), inlines `icon.svg` as the tab icon and copies `src/public/` next to the page. After a change to how the game looks, run `npm run preview` to remake the image and the home-screen icon from the newest save, look at them, and commit them.

## How we work

Every change goes round the same loop, and each round leaves something that makes the next one safer: a check, a save, a note.

1. **Issue.** Work starts from a GitHub issue (Feature, Bug or Balance template). Ideas and priorities live in `docs/ROADMAP.md`; the owner decides what moves up.
2. **Spec.** Anything a player would notice as new gets a one-page spec from `docs/specs/TEMPLATE.md`, approved by the owner before building.
3. **Build** on a `feature/<short-name>` branch from `main`, one change per branch.
4. **Prove.** Checks pass, screenshots looked at, and the bot on seeds 1–3 for economy changes.
5. **Ship.** A PR from `.github/pull_request_template.md`; the owner squash-merges; `main` publishes.
6. **Learn.** A bug that reached players gets the check that would have caught it. A change that sets a rule gets a record in `docs/decisions/`.

Playbooks for each part are in `.claude/skills/`: `feature` (issue to merged PR), `balance` (measuring with the bot), `release` (history and save fixtures) and `steward` (getting a PR to green). Keep these notes true: a PR that changes how something works updates them in the same PR.

## Build and test

- `npm run build`: builds `dist/index.html` and `build/test.html`, which has `window.__sim` exposed. It needs no dependencies. It fails, naming the file and line, on a syntax error, a top-level name declared twice, a `</script>` inside the game, duplicate top-level function names or a lost marker.
- `node tools/where.mjs <line>` turns a line number from an error in `dist/index.html` or `build/test.html` into `src/game/<file>:<line>`.
- `npm install` once (web sessions do it at start-up through `.claude/hooks/session-start.sh`), then `npm run check`. It takes about 1–2 minutes with Playwright and Chromium, and covers:
  - headless sim;
  - every save in `tools/saves` loading and playing;
  - layout from 320 to 2560 px, portrait and landscape;
  - phone sheet dragging with touch;
  - the full-screen drawer;
  - the guided start;
  - `rules`: the same seed plays the same game, cheaper fares fill more seats and keep more travellers from Lowmere, costs rise with level, planes lose value with wear, levels ask for more each time, plan and goal ids are sound, and loading a save twice changes nothing;
  - `shots`: phone, tablet and desktop screenshots of the airport, world and region in `build/shots/`. CI keeps them as the "screenshots" artifact on every PR;
  - `share`: the link-preview tags are filled in, and the preview image (1200×630, under 300 KB) and home-screen icon are published;
  - `layouts`: every layout plays two hours fully built without errors, the Layout tab fits a 320 px phone, and each layout's screenshot goes in `build/shots/`;
  - `news`: What's new opens once for an older save and not again, never for a new game, and from Settings with every version;
  - `perf`: how long a level 9 airport takes to simulate, against a calibration run so machines compare (fails over its budget), and how close a CPU-throttled phone gets to full speed at 8× (reported only).

  Run `npm run check -- rules` to run one group. Every page in the checks is seeded, so a failure repeats when you run it again. When you change a rule on purpose, update its check in the same PR; add a check when you add a rule.
- Playwright is pinned to 1.56.1, whose Chromium (build 1194) the web image already has. If Chromium is missing, run `npx playwright install chromium`, or set `CHROMIUM_PATH` to an existing Chromium binary. Change the pin only together with the lock file.
- For economy or progression changes, run the bot on seeds 1, 2 and 3: `npm run bot -- 1150 --seed 2` (the default seed is 1). Each run takes 3–4 minutes, so run them in the background, side by side: `nohup npm run bot -- 1150 --seed 2 > build/bot-2.log 2>&1 &`. The last lines are `SEED`, `LVLAT {level: game hour}`, `STATE` (a fingerprint of the whole game state at the end), `ERR [...]` and a table against `tools/baseline.json`. The same seed and code always give the same run, so run the same seeds before and after a change to see its effect. A change meant to leave the game as it is, such as a speed-up or a refactor, must leave `STATE` identical on seeds 1–3; compare against a build of `main` (`git worktree add`). The bot keeps the Classic layout unless you pass `'{"layouts":true}'`, which makes it approve layout plans and rebuild (Remote apron, then Satellite, then Starfish). The "Balance" workflow runs seeds 1–3 both ways on PRs that touch `src/game/` or the bot, and puts the tables in the run's summary.
- For UI changes, look at the result. `npm run check -- shots` covers the three main views; for anything else, write a small Playwright script in `build/` (git-ignored) that opens `build/test.html` at phone (390×844, `hasTouch`, `isMobile`), tablet (768×1024) and desktop (1440×900) sizes, then screenshots it and reads the images.
- Seed a save through `localStorage['final-call-save-v2']` in an init script, and the random seed through `window.__seed`. `tools/saves/*.json` and `build/saves/L<n>.json` (written by the bot) are ready-made airports at each level.
- `tools/saves/` keeps saves from every version that changed what gets saved (`v<version>-L<level>.json`). When a release adds saved fields, add saves made with it from `build/saves/`, so old saves keep being tested for good.

### Balance baselines (bot, 1150 game hours)

`tools/baseline.json` holds these ranges; the bot and the Balance workflow read them from there. Change both together, and only for a balance change the owner asked for.

| Level reached | Game hour |
| --- | --- |
| 1 Local Airport | 31–41 |
| 3 City Airport | 95–117 |
| 5 Gateway Airport | 340–370 |
| 7 Global Hub | 630–770 |
| 9 Airport of the Year | 1,080–1,115 |

With these baselines there are no errors. They are for an airport that keeps Classic; rebuilding well should reach level 9 about 10% sooner (990–1,005 on seeds 1–3). If the bot ignores Lowmere, its share settles at about 50–60%. Keep pacing within about 15% of these numbers unless the owner asks for a change.

## How the code is organised

The game is one strict IIFE, split into files in `src/game/`. The build joins them in file-name order, so they share one scope: any file can use what another declares at the top level, and order only matters for code that runs at load time (`99-start.js` runs last and starts the game). Keep a new system in its own file, numbered before `99-start.js`.

| Files | What's in them |
| --- | --- |
| `00-random` | `rnd()`, the seeded random generator the simulation uses |
| `01-constants` to `04-geometry` | Constants and level data, the Masterplan (`TECH`), state (`G`, `R`, `DEFAULT`), airport geometry |
| `05-flights` to `11-main-update` | Flights, sound, passengers, stands, construction/levels/days, events and toasts, `update()` |
| `12-drawing` to `14-board` | Drawing the airport, the camera, the departures board |
| `15-panel` to `21-layout` | Side panel, advisor, help/keys/speed, Masterplan UI, phone bottom sheet, full screen, layout |
| `22-save`, `23-boot` | Saving and migrating (`resetAll`), boot and the frame loop |
| `24-region-places` to `30-region-ui` | The region: places and stations, helpers, the journey network, events and line building, weather, map drawing, the Region tab |
| `31-routes` to `37-cloud-saves` | Routes and the world map, managers and recommendations, Lowmere, airline operations, records/stamps/challenges, guided start, saves across devices |
| `38-updates` | What's new: the `UPDATES` list (every version, newest first) and its card |
| `39-layouts`, `40-layout-drawing` | Airport layouts: the `LAYOUTS` table, rebuilding and switching, the Airfield › Layout tab; remote stands, buses, rooms, shop units and each layout's buildings |
| `41-airside` | Stand frames (`XF`, `toW`, `toL`), airside rooms and doorways (`route`, `walk`), and `layoutFaults`, the fit check for 2D layouts |
| `99-start` | The `/*SIM_HOOK*/` marker and the call that starts the game |

Some functions sit where they were first written rather than where their name suggests (`pickRoute` is in `03-state.js`), so search `src/game/` by name.

`src/shell.html` holds the CSS, the HTML skeleton and a `/*GAME*/` placeholder inside the only `<script>`.

### State

- **`G` and `R`.** `G` is the saved state (JSON in `localStorage['final-call-save-v2']`). `R` is runtime only.
- **New and old saves.** `DEFAULT()` builds a new game. `resetAll(state)` loads and migrates any older save. When you add state, give it a default in `DEFAULT()` and handle its absence in `resetAll`. Never rename or remove saved fields, because old saves must keep loading.
- **Other localStorage keys:**
  - `final-call-topgap`: the phone camera band;
  - `final-call-cloud` and `final-call-device`: bookkeeping for saves across devices.

### Time

`update(dt)` advances game minutes. The frame loop takes steps of up to 0.034 minutes, or 0.1 minutes at 4× and 8× (the bot's step size, a third of the work). These hooks run from it:
- Every game minute: `updateBuilds`, `dayTick`, `checkLevel`, `fleetTick`.
- `managersTick` runs every 6 hours, `crewTick` every 30 minutes and `recordsHour` every hour. `nightChecks` runs at 03:00.
- `dayTick` runs `recordsDay`, `regionDay`, `rivalDay` and `chalDay`.

### Headless sim

- `R.sim=true` means:
  - no DOM work and no saving;
  - toasts resolve to their last choice.
- Everything reachable from `update()` must work that way.
- **Randomness.** Anything that can change the game state uses `rnd()`, never `Math.random()`, so a seed repeats a run exactly. Only sound, the board's flaps, weather drawing and the device id use `Math.random()`, and the build rejects it on any line that doesn't end with `// cosmetic`.
- Tests reach functions through `window.__sim`. Its list is in `tools/build.mjs`; add to it when a test needs something new.

### UI

- Panels are HTML strings built by `renderPanel()`. Clicks are handled in one delegated listener through `data-*` attributes (also `recsClick`, `routesClick` and the region click).
- Sub-tabs use `segs()`. The Office has Plan, Money, Reports, Records, Policies and Settings.
- Tab ids are `stands` (Gates), `routes`, `terminal`, `ground` (Airfield), `sales`, `region` and `office`.

### Views and phone layout

- **Views:** `R.view` is `airport`, `region` or `world`, and `setView` switches between them.
- **Keyboard:** Space pauses, R opens the region, W the world, P the Masterplan, F full screen and H help.
- **Portrait phones:** the panel is a bottom sheet (`#side`) that is dragged by `#grip`.
  - While dragging, the sheet slides over the map using a negative `marginTop`, and `resize()` keeps the zoom. It snaps to 0/1/2 using `sheetMax()`.
  - In full screen, the sheet becomes a drawer opened with the Manage button.
- **Landscape phones** (height ≤ 500) show the map and panel side by side, with the board hidden.
- **Camera band:** `--gapsz` is set from the player's choice. It becomes `--topgap` in portrait and `--sidegap` in landscape.

### Gating and settings

- **Gating:** `has('kind:id')` (for example `up:desks`, `ac:3`, `rt:2`, `mode:hsr`, `feat:slots`) comes from approved Masterplan plans (`TECH`, 58 plans in 6 branches; the sixth is Layouts). Level unlocks come from `LEVELS`, which has 10 levels from Airfield to Airport of the Year.
- **Settings** live in `G.set`, read through `SET()`:
  - notifications: `tips`, `msgs`, `pops`, `goal`, `recs`, `badges`;
  - managers: `autoLines`, `autoFares`, `autoCrews`;
  - weekly challenges: `chal`.
  - Toasts follow `msgs` unless they reply to a tap in the last 900 ms. Floaters follow `pops`.

## Systems in brief

- **Levels and Masterplan.** Level-ups and some goals give plan points. Consultants sell points from level 4. `GOALS` is a sequential list, and `curGoal()` returns the first goal that is unfinished and available.
- **Routes.**
  - Each city has a market in seats per day (`cityMarket`, which includes Lowmere's cut through `rivKeep`).
  - `routeLF` gives how full a flight will be.
  - The dispatcher `pickRoute` sends each plane where it earns most per hour.
  - Fares are −20%, standard or +25% per route.
- **Region.** Bus, tram, rail, metro and high-speed lines, development sites, events, and weather.
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
  - **2D layouts** (Classic, Remote apron, Staggered apron, Curved front, and Hall and finger pier so far) also have `rooms` (convex floors), `doors` (`[roomA, roomB, x, y, half-width]`), `top` (how far up the runway moves) and `decor`. Their stands have a face point `x`,`y` and a heading `h` (where the nose points, degrees clockwise from north) and park nose-in; shop units add `y`, an angle and a room.
    - Helpers build the shapes: `CLP` (Classic's parts, shared with the Remote apron and Staggered apron), `pierParts` (a pier from a wall, with stands on either side and a wider head for a stand at its tip), `arcParts` (a curved concourse, one segment per stand).
    - A stand's `lean` (herringbone) turns its plane and `back` sets it back from the wall, while its bridge root and lounge stay square to the wall (the face frame, `faceW`).
    - A 2D remote stand has a bus `gate` (`[x, y, 1 or -1 for the lounge below or above it]`) in its room and a bus `road` out to the plane.
    - Each stand's information card goes to the first clear spot around its plane (`placeBadges`).
  - **Stand frames.** Each stand's frame (`XF[i]`) turns plane-local coordinates (x across, y along with the nose up, as `geom()` lays them out) into the world: use `toW(i,x,y)`, `wx`/`wy`, and `standCtx(i)` to draw in it. Old straight-line stands have 'tail' frames that give exactly the old numbers. Keep words upright: draw text at `toW` positions, not inside `standCtx`.
  - **Rooms.** Passengers walk straight within a room; `route(p,room)` lists the doorways to their target's room (the shortest walk, worked out once per layout) and `walk()` follows them. With no rooms, both do nothing, and the game plays exactly as before.
  - Layouts unlock as Masterplan plans (`has('lay:<id>')`) and are rebuilt as a construction job `layout:<id>`. The switch happens at the first 03:00 after it's built (`G.layoutNext`, `G.layoutAt`), once stands it drops have seen off their last flight; kept stands move with their planes and passengers, and what doesn't fit is sold.
  - Effects come from what the game already simulates: positions and distances, stand and shop counts, `walk` (moving walkways) and `mover` (people mover) speed-ups, hall shops' extra pull, remote stands' buses (loads of 40 every 5 minutes, slower in rain, short-haul planes only, a small rating cost), and `upk` running costs.
  - The `rules` check keeps every layout sound: names, buying order, wings, lounges and shops for straight-line layouts, and `layoutFaults` for 2D ones (planes touching planes or buildings, lounges and shops outside their rooms, doorways, convex and reachable rooms, gate cards covering planes). Classic is every save's default.
- **What's new.** `UPDATES` holds every version's headline and points. The card opens after loading when `G.seen` is older than the newest version (not for new games or during the guided start) and from Settings or Help. Each release adds an entry; the `rules` check matches it against `docs/HISTORY.md`.
- **Guided start.** A 6-step tour (`TOUR`) runs on new games only and can be skipped or replayed from Help. It turns itself off on any save with progress.
- **Saves across devices.** These only work on claude.ai, through `window.claude.use('db')`. On GitHub Pages `window.claude` is undefined, so the game saves on the device only. Keep that fallback working.

## Owner's preferences

- No choice of scenario at the start.
- Hide locked items instead of greying them out.
- Show impacts on the map, board and gates, not text events.
- Keep text concise and in UK English.
- Balance matters: check with the bot after economy changes.
- Keep the long headless simulation working.
- Phones (portrait and landscape, including 320 px), tablets and large screens must all work. Leave room for the phone camera, which is set in Settings › Screen.
- Players who don't want the details get managers and recommendations; late-game players can take control themselves.
