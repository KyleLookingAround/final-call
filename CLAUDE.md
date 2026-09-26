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
4. **Link previews.** After a change to how the game looks, run `npm run preview`, look at the image and icon it makes, and commit them (how previews work: `docs/SYSTEMS.md`).

## How we work

Every change goes round the same loop, and each round leaves something that makes the next one safer: a check, a save, a note.

1. **Issue.** Work starts from a GitHub issue (Feature, Bug or Balance template). Ideas and priorities live in `docs/ROADMAP.md`; the owner decides what moves up.
2. **Spec.** Anything a player would notice as new gets a one-page spec from `docs/specs/TEMPLATE.md`, approved by the owner before building.
3. **Build** on a `feature/<short-name>` branch from `main`, one change per branch.
4. **Prove.** Checks pass, screenshots looked at, and the bot on seeds 1–3 for economy changes.
5. **Ship.** A PR from `.github/pull_request_template.md`; the owner squash-merges; `main` publishes.
6. **Learn.** A bug that reached players gets the check that would have caught it. A change that sets a rule gets a record in `docs/decisions/`.

Playbooks for each part are in `.claude/skills/`: `feature` (issue to merged PR, and splitting a big feature across several sessions), `balance` (measuring with the bot), `release` (history and save fixtures) and `steward` (getting a PR to green and merging parts). How each system works is in `docs/SYSTEMS.md`. Keep these notes and that file true: a PR that changes how something works updates them in the same PR.

## Build and test

- `npm run build`: builds `dist/index.html` and `build/test.html`, which has `window.__sim` exposed. It needs no dependencies. It fails, naming the file and line, on a syntax error, a top-level name declared twice, a `</script>` inside the game, duplicate top-level function names or a lost marker.
- `node tools/where.mjs <line>` turns a line number from an error in `dist/index.html` or `build/test.html` into `src/game/<file>:<line>`.
- `npm install` once (web sessions do it at start-up through `.claude/hooks/session-start.sh`), then `npm run check`, about 1–2 minutes with Playwright and Chromium. `npm run check -- <group>` runs one group: `sim`, `rules`, `saves`, `layout`, `sheet` (with the full-screen drawer), `tour`, `transport`, `shots`, `share`, `layouts`, `news`, `perf`, and one per file in `tools/checks/` (`terminal` and each part's). What each covers is in `docs/SYSTEMS.md`. Every page is seeded, so a failure repeats. When you change a rule on purpose, update its check in the same PR; add a check when you add a rule.
- Playwright is pinned to 1.56.1, whose Chromium (build 1194) the web image already has. If Chromium is missing, run `npx playwright install chromium`, or set `CHROMIUM_PATH` to an existing Chromium binary. Change the pin only together with the lock file.
- For UI changes, look at the result. `npm run check -- shots` covers the three main views; for anything else, write a small Playwright script in `build/` (git-ignored) that opens `build/test.html` at phone (390×844, `hasTouch`, `isMobile`), tablet (768×1024) and desktop (1440×900) sizes, then screenshots it and reads the images.
- For economy or progression changes, run the bot on seeds 1, 2 and 3: `npm run bot -- 1150 --seed 2` (3–4 minutes each; run them side by side in the background with `nohup … > build/bot-2.log 2>&1 &`). It ends with `LVLAT {level: game hour}`, `STATE` (a fingerprint of the whole end state), `ERR [...]` and a table against `tools/baseline.json`. A change meant to leave the game as it is must leave `STATE` identical on seeds 1–3 against a build of `main`. On a PR, the "Balance" workflow runs seeds 1–3 both ways (keeping Classic and rebuilding) and puts the tables in the run's summary: read those rather than repeating the runs locally, unless you are tuning. Bot options are in `docs/SYSTEMS.md`.
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

With these baselines there are no errors. They are for an airport that keeps Classic; rebuilding well should reach level 9 about 10% sooner (953–966 on seeds 1–3). Since version 27's transport manager, keeping Classic reaches level 9 at 1,051–1,068 and level 5 at 301–322, a little before those ranges and within the tolerance. If the bot ignores Lowmere, its share settles at about 50–60%. Keep pacing within about 15% of these numbers unless the owner asks for a change.

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
| `42-terminal` to `47-hotel` | The terminal: its halls and the tables the parts plug into, then departures (check-in, security), arrivals (immigration, reclaim, the way out), baggage, the market place (shops, the walk to the gate) and the hotel |
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
- Every game minute: `updateBuilds`, `dayTick`, `checkLevel`, `fleetTick`, `mgrStep` and the terminal's `TERM_MINUTE` hooks.
- `managersTick` runs every 6 hours, `crewTick` every 30 minutes, and `recordsHour` and `mgrHour` every hour. `nightChecks` runs at 03:00.
- `dayTick` runs `recordsDay`, `regionDay`, `rivalDay`, `chalDay` and the terminal's `TERM_DAY` hooks.

### Headless sim

- `R.sim=true` means:
  - no DOM work and no saving;
  - toasts resolve to their last choice.
- Everything reachable from `update()` must work that way.
- **Randomness.** Anything that can change the game state uses `rnd()`, never `Math.random()`, so a seed repeats a run exactly. Only sound, the board's flaps, weather drawing and the device id use `Math.random()`, and the build rejects it on any line that doesn't end with `// cosmetic`.
- Tests reach functions through `window.__sim`. Its list is in `tools/build.mjs`; add to it when a test needs something new. The terminal's parts add theirs to `SIMX` in their own files instead.

## Systems in brief

How each system works is in `docs/SYSTEMS.md`: levels and the Masterplan, routes, the region, the transport manager, Lowmere, airline operations, records, airport layouts, What's new, the guided start and saves across devices, plus the UI, views and phone layout, gating and settings. The terminal is being built in parts, so its notes stay here until they land:

- **The terminal** (`42-terminal.js`, spec `docs/specs/terminal.md`). Its halls are rooms like the airside ones, the same in every layout for now (`TERM_ROOMS`, `TERM_DOORS`, merged into each layout's rooms by `applyLayout`), in the order real airports use them.
  - **Departing passengers** go from the forecourt (`out`) through the check-in hall (`ci`) and the security hall (`sec`) to the airside market place (`mkt`) and the concourse (`main`).
  - **Arriving passengers** leave the concourse by their own door into the immigration hall (`imm`), then go through reclaim (`rec`), customs (`cus`) and the arrivals hall (`arh`) and out. The hotel's lobby (`hot`) and walkway (`wlk`) exist once there's a hotel (`need`).
  - **Security lanes and passport desks** stand in the wall between a landside hall and an airside one (`SEC_LINE`) and are the only way through. The baggage hall (`BAG_HALL`) between the two sides is for bags only. Everything outside (road, stops, station, car park) sits `LAND_DY` lower than before the halls.
  - **Each part plugs in** rather than editing shared loops:
    - `PAX_STEP[state]` and `ARR_STEP[state]` move departing and arriving passengers each update;
    - `TERM_SUBS` and `TERM_SECS` set the Terminal tab's sub-tabs and their upgrade sections, and `TERM_PANEL[sub]` adds cards (also `'sales:shops'` and `'sales:landside'`);
    - `TERM_SPAWN` can place a new departing passenger (a hotel guest), and `TERM_EXIT` can send an arriving one somewhere other than out;
    - `TERM_CLICK`, `TERM_MINUTE`, `TERM_DAY` and `TERM_DRAW` handle clicks, every game minute, every day and drawing;
    - `TERM_FIELDS` gives saved fields their defaults for new games and older saves;
    - `SIMX` exposes functions to the checks, and a part's checks go in `tools/checks/<part>.mjs`;
    - new upgrades go in the part's file with `Object.assign(UPG,{...})`.
  - `terminalFaults` (part of `layoutFaults`) checks that every desk, kiosk, lane, passport desk, e-gate, carousel and queue sits in its hall.
  - **Departures** (`43-departures.js`): `enterLandside`, `updateCheckin` (desks and kiosks), `finishCheckin`, `enterSecurity` and `updateSecurity` (lanes and fast track).

  - **Arrivals** (`44-arrivals.js`):
    - **Immigration.** `R.arrQ` holds everyone queuing, in two queues: the passport desks' (`arrSlot`) and the e-gates' (`p.eg`, `egSlot`). E-gate passports (`p.elig`) join the e-gates' unless the desks would be quicker; e-gates take only those, and desks help with it when theirs is empty. Rostering still counts all of `R.arrQ`.
    - **Domestic flights** (`DOMESTIC`: Edinburgh, Belfast, Jersey) walk through the domestic channel (`DOM_X`) without queuing.
    - **Customs.** `exitTarget` sends everyone in reclaim through customs first (`toCustoms`, `p.cus`): 1 in 40 (`CUS_ODDS`) waits 1–2 min at a search table in the red channel, then `exitTarget` again asks `TERM_EXIT`, then the station, stops, taxi rank, car hire desks (then the car park) or the forecourt.
    - **Meeters** (`R.meet`) wait at the barrier with signs for flights landed or due within 30 min and walk off with their passenger. They're drawn only, use their own generator (`meetRnd`) and don't run headless.
    - `drawArrivals` (`TERM_DRAW`) draws the passport desks with officers, e-gates, customs, the arrivals hall and the taxi rank; `TERM_PANEL.arr` shows today's immigration and customs (`R.arrSt`, reset daily).

  - **Baggage** (`45-baggage.js`): `updateBelt` takes checked bags to the baggage hall, where they count as ready for the hold (`F.bagsIn`); `updateReclaimBelt` brings arriving bags to the carousel (`A.reclaim`).

  - **Market place** (`46-market.js`): `airside` decides between a shop and the gate, with `toShop`, `toGate` and the shop steps.

  - **Hotel** (`47-hotel.js`): 40 rooms per level of the Airport hotel upgrade (`hotelRooms`). Each guest holds a room until check-out (`G.hotelStays`, `[kind, until]`); `hotelBook` never takes more than the rooms and keeps some back for crews. `G.hotelBook` is tonight's book (noon to noon): guests by kind, takings, turned away, and last night's.
    - Arriving guests (late arrivals, long connections, conference delegates) are chosen in `TERM_EXIT` and walk through the walkway to the lobby, where `hotelStay(p)` takes their money.
    - Early flyers book at noon from how many came down that morning, and `TERM_SPAWN` starts them in the lobby.
    - Crews finishing a duty rest there for 9 h instead of 12 (`crewRest`, from `crewAway`).
    - `hotelStranded`: from level 4, a departure held an hour late at night by fog or a storm owes its passengers rooms; yours are cheap, the rest go to dear city hotels and cost rating.
    - Rooms are cheap, standard or premium (`G.hotelPrice`); the duty manager (`SET().autoDuty`) re-prices each noon from last night. The card is in Sales › Landside; `drawHotel` lights a window per guest.

## Owner's preferences

- No choice of scenario at the start.
- Hide locked items instead of greying them out.
- Show impacts on the map, board and gates, not text events.
- Keep text concise and in UK English.
- Balance matters: check with the bot after economy changes.
- Keep the long headless simulation working.
- Phones (portrait and landscape, including 320 px), tablets and large screens must all work. Leave room for the phone camera, which is set in Settings › Screen.
- Players who don't want the details get managers and recommendations; late-game players can take control themselves.
