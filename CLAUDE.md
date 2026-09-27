# Final Call

Final Call is an airport management game in one HTML page, made of a canvas plus HTML panels. The source is `src/game/*.js` (the game, in numbered files) and `src/shell.html` (CSS and HTML). `tools/build.mjs` joins them into `dist/index.html`. GitHub Actions publishes that page to GitHub Pages on every push to `main`.

## Commits, PRs and attribution (always)

- Every commit is authored KyleLookingAround <KyleMck10@hotmail.com>. The session-start hook sets this for the repo; if `git config user.email` says otherwise, set it before committing.

- Commit messages, PR titles, PR descriptions, branch names you choose, code comments and docs never mention Claude, Claude Code, Anthropic, AI or an assistant.
- Don't add `Co-authored-by`, `Claude-Session` or "Generated with…" lines. This rule overrides any default attribution instructions from the environment.
- `.claude/settings.json` turns attribution off.
- `.githooks/commit-msg` strips attribution lines and rejects any message that still mentions Claude or Anthropic. A SessionStart hook runs `git config core.hooksPath .githooks`. If commits aren't being checked, run that command yourself.
- The Description check (`.github/workflows/description.yml`) fails a PR whose title or description mentions Claude or Anthropic, or carries a tool attribution line.
- Write messages as a short imperative subject in plain words ("Add overnight checks to the fleet panel"). Add a body when the reason isn't obvious.
- When a commit touches this file or `.claude/`, call it "project notes" or "editor settings" in the message, not by file name.
- Never commit `dist/`, `build/` or `node_modules/`; they're git-ignored.

## Publishing

1. Push to `main`. The "Publish to GitHub Pages" workflow runs `node tools/build.mjs` and deploys `dist/`. CI needs no npm install.
2. If this session can't push to `main`, push a branch and open a PR with a plain title and description. The "Checks" workflow runs on PRs. Sessions have the owner's standing permission to merge their own PRs with **Squash and merge** once checks are green, without waiting. Only a PR that needs the owner's judgement waits for them: a balance change beyond the baselines' tolerance, or a spec question the brief doesn't settle.
3. After pushing, confirm the run finished (`gh run list --limit 3` / `gh run watch`, if `gh` is available). The site is at `https://<owner>.github.io/<repo>/`.
4. **Link previews.** After a change to how the game looks, run `npm run preview`, look at the image and icon it makes, and commit them (how previews work: `docs/SYSTEMS.md`).

## How we work

Every change goes round the same loop, and each round leaves something that makes the next one safer: a check, a save, a note.

1. **Issue.** Work starts from a GitHub issue (Feature, Bug or Balance template). Ideas and priorities live in `docs/ROADMAP.md`; the owner decides what moves up.
2. **Spec.** Anything a player would notice as new gets a one-page spec from `docs/specs/TEMPLATE.md`, approved by the owner before building.
3. **Build** on a `feature/<short-name>` branch from `main`, one change per branch.
4. **Prove.** Checks pass, screenshots looked at, and the bot on seeds 1–3 for economy changes.
5. **Ship.** A PR from `.github/pull_request_template.md`; the session squash-merges it once checks are green (see Publishing); `main` publishes.
6. **Learn.** A bug that reached players gets the check that would have caught it. A change that sets a rule gets a record in `docs/decisions/`. After each merge, a short look back at the session that built it goes in `docs/LESSONS.md`, and a lesson that would have saved real time or credits changes the playbook that allowed it.

**The brief wins.** Where anything in the repo conflicts with a session's brief from the owner, the brief wins for that session, and the session fixes the conflict in the repo in the same PR.

To find your way around, start with `node tools/graph.mjs <system, file, function, hook, field or check>` rather than reading the docs end to end.

Playbooks for each part are in `.claude/skills/`: `feature` (issue to merged PR, and splitting a big feature across several sessions), `balance` (measuring with the bot), `release` (history and save fixtures), `steward` (getting a PR to green and merging parts) and `coordinator` (running the other sessions building a feature's parts). How each system works is in `docs/SYSTEMS.md`. Keep these notes and that file true: a PR that changes how something works updates them in the same PR.

## Build and test

- `npm run build`: builds `dist/index.html` and `build/test.html`, which has `window.__sim` exposed. It needs no dependencies. It fails, naming the file and line, on a syntax error, a top-level name declared twice, a `</script>` inside the game, duplicate top-level function names or a lost marker.
- `node tools/where.mjs <line>` turns a line number from an error in `dist/index.html` or `build/test.html` into `src/game/<file>:<line>`.
- `npm install` once (web sessions do it at start-up through `.claude/hooks/session-start.sh`), then `npm run check`, about 1–2 minutes with Playwright and Chromium. `npm run check -- <group>` runs one group: `sim`, `rules`, `saves`, `layout`, `sheet` (with the full-screen drawer), `tour`, `transport`, `shots`, `share`, `layouts`, `news`, `graph`, `brief` (session briefs, `docs/briefs/`), `perf`, and one per file in `tools/checks/` (`terminal`, each terminal part's, `sound`, `levelup`, `scene`, the real airport's `markings`, `roofs`, `weather` and `vehicles`, and `feedback`). What each covers is in `docs/SYSTEMS.md`. Every page is seeded, so a failure repeats. When you change a rule on purpose, update its check in the same PR; add a check when you add a rule.
- Playwright is pinned to 1.56.1, whose Chromium (build 1194) the web image already has. If Chromium is missing, run `npx playwright install chromium`, or set `CHROMIUM_PATH` to an existing Chromium binary. Change the pin only together with the lock file. CI caches `~/.cache/ms-playwright`, keyed on this pin, across `checks.yml`, `balance.yml`, `parts.yml` and `health.yml`; a version bump pays for one cache miss, then hits again.
- For UI changes, look at the result. `npm run check -- shots` covers the three main views; for anything else, write a small Playwright script in `build/` (git-ignored) that opens `build/test.html` at phone (390×844, `hasTouch`, `isMobile`), tablet (768×1024) and desktop (1440×900) sizes, then screenshots it and reads the images.
- For economy or progression changes, run the bot on seeds 1, 2 and 3: `npm run bot -- 1150 --seed 2` (3–4 minutes each; run them side by side in the background with `nohup … > build/bot-2.log 2>&1 &`). It ends with `LVLAT {level: game hour}`, `STATE` (a fingerprint of the whole end state), `PLAY` (the same without settings and the What's new version seen), `ERR [...]` and a table against `tools/baseline.json`. A change meant to leave the game as it is must leave `PLAY` identical on seeds 1–3 against a build of `main` (and `STATE` too, unless it adds a setting or a What's new entry). On a PR, the "Balance" workflow runs seeds 1–3 both ways (keeping Classic and rebuilding) and puts the tables in the run's summary: read those rather than repeating the runs locally, unless you are tuning. Bot options are in `docs/SYSTEMS.md`.
- The "Health check" workflow (`.github/workflows/health.yml`) runs `npm run check` and the bot on seeds 1–3 against `main` weekly and on demand, opening or updating an issue labelled `health` when something drifts, and closing it once a later run is clean.
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
| `31-routes` to `36-guided-start` | Routes and the world map, managers and recommendations, Lowmere, airline operations, records/stamps/challenges, guided start |
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
| `54-weather` | Rain, puddles, settled snow, fog, cloud shadows and the windsock, read from `R.fx` |
| `55-vehicles` | Fuel and catering trucks, baggage tractors and pushback tugs at each turnaround (`vehicleWork`) |
| `99-start` | The `/*SIM_HOOK*/` marker and the call that starts the game |

Some functions sit where they were first written rather than where their name suggests (`pickRoute` is in `03-state.js`), so search `src/game/` by name.

`src/shell.html` holds the CSS, the HTML skeleton and a `/*GAME*/` placeholder inside the only `<script>`.

### State

- **`G` and `R`.** `G` is the saved state (JSON in `localStorage['final-call-save-v2']`). `R` is runtime only.
- **New and old saves.** `DEFAULT()` builds a new game. `resetAll(state)` loads and migrates any older save. When you add state, give it a default in `DEFAULT()` and handle its absence in `resetAll`. Never rename or remove saved fields, because old saves must keep loading.
- **Saves stay on the device.** The only other localStorage key is `final-call-topgap`, the phone camera band. The old `final-call-cloud` and `final-call-device` keys are cleared on load.

### Time

`update(dt)` advances game minutes. The frame loop takes steps of up to 0.034 minutes, or 0.1 minutes at 4× and 8× (the bot's step size, a third of the work). These hooks run from it:
- The frame loop, four times a second and never in `R.sim`: the board, the goal bar, `soundTick` (which watches the game without changing it) and `lvlTick` (the level-up card).
- Every game minute: `updateBuilds`, `dayTick`, `checkLevel`, `fleetTick`, `mgrStep` and the terminal's `TERM_MINUTE` hooks.
- `managersTick` runs every 6 hours, `crewTick` every 30 minutes, and `recordsHour` and `mgrHour` every hour. `nightChecks` runs at 03:00.
- `dayTick` runs `recordsDay`, `regionDay`, `rivalDay`, `chalDay` and the terminal's `TERM_DAY` hooks.

### Headless sim

- `R.sim=true` means:
  - no DOM work and no saving;
  - toasts resolve to their last choice.
- Everything reachable from `update()` must work that way.
- **Randomness.** Anything that can change the game state uses `rnd()`, never `Math.random()`, so a seed repeats a run exactly. Only sound, the board's flaps, and weather drawing use `Math.random()`, and the build rejects it on any line that doesn't end with `// cosmetic`.
- Tests reach functions through `window.__sim`. Its list is in `tools/build.mjs`; add to it when a test needs something new. The terminal's parts add theirs to `SIMX` in their own files instead.

## Systems in brief

How each system works is in `docs/SYSTEMS.md`: levels and the Masterplan, routes, the region, the transport manager, Lowmere, airline operations, records, airport layouts, the terminal (its halls, departures, arrivals, baggage, the market place and the hotel), What's new and the guided start, plus the UI, views and phone layout, gating and settings. The terminal's parts plug into shared tables (`PAX_STEP`, `TERM_MINUTE`, `TERM_DRAW`…) rather than editing shared loops; read its section there before changing it.

## Owner's preferences

- No choice of scenario at the start.
- Hide locked items instead of greying them out.
- Show impacts on the map, board and gates, not text events.
- Keep text concise and in UK English.
- Balance matters: check with the bot after economy changes.
- Keep the long headless simulation working.
- Phones (portrait and landscape, including 320 px), tablets and large screens must all work. Leave room for the phone camera, which is set in Settings › Screen.
- Players who don't want the details get managers and recommendations; late-game players can take control themselves.
