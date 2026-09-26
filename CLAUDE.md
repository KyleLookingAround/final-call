# Final Call

Final Call is an airport management game in one HTML page, made of a canvas plus HTML panels. The source is `src/game.js` and `src/shell.html`. `tools/build.mjs` joins them into `dist/index.html`. GitHub Actions publishes that page to GitHub Pages on every push to `main`.

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

## Build and test

- `npm run build`: builds `dist/index.html` and `build/test.html`, which has `window.__sim` exposed. It needs no dependencies, and it fails on a lost marker, a `</script>` inside game.js, or duplicate top-level function names.
- `npm install` once, then `npm run check`. It takes about 1–2 minutes with Playwright and Chromium, and covers:
  - headless sim;
  - every save in `tools/saves` loading and playing;
  - layout from 320 to 2560 px, portrait and landscape;
  - phone sheet dragging with touch;
  - the full-screen drawer;
  - the guided start.
  
  Run `npm run check -- layout` to run one group.
- If Chromium is missing, run `npx playwright install chromium`, or set `CHROMIUM_PATH` to an existing Chromium binary.
- For economy or progression changes, run `npm run bot -- 1150`. It takes 3–4 minutes, so run it in the background: `nohup npm run bot -- 1150 > build/bot.log 2>&1 &`. The last lines are `LVLAT {level: game hour}` and `ERR [...]`.
- For UI changes, look at the result. Write a small Playwright script in `build/` (git-ignored) that opens `build/test.html` at phone (390×844, `hasTouch`, `isMobile`), tablet (768×1024) and desktop (1440×900) sizes, then screenshots it and reads the images.
- Seed a save through `localStorage['final-call-save-v2']` in an init script. `tools/saves/*.json` and `build/saves/L<n>.json` (written by the bot) are ready-made airports at each level.

### Balance baselines (bot, 1150 game hours)

| Level reached | Game hour |
| --- | --- |
| 1 Local Airport | 31–41 |
| 3 City Airport | 95–117 |
| 5 Gateway Airport | 340–370 |
| 7 Global Hub | 630–770 |
| 9 Airport of the Year | 1,080–1,115 |

With these baselines there are no errors. If the bot ignores Lowmere, its share settles at about 50–60%. Keep pacing within about 15% of these numbers unless the owner asks for a change.

## How the code is organised

`src/game.js` is one IIFE. Search for the section banners `/* ================= … ================= */`, in this order:
- constants
- Masterplan
- state
- geometry
- flights
- sound
- passengers
- stands
- construction/levels/days
- events & toasts
- main update
- drawing
- camera
- board
- panel
- advisor
- help/keys/speed
- Masterplan UI
- bottom sheet (phones)
- full screen
- layout
- save
- boot
- REGION
- ROUTES
- managers and recommendations
- LOWMERE
- AIRLINE OPERATIONS
- RECORDS, STAMPS AND WEEKLY CHALLENGES
- GUIDED FIRST HOUR
- SAVES ACROSS DEVICES

`src/shell.html` holds the CSS, the HTML skeleton and a `/*GAME*/` placeholder inside the only `<script>`.

### State

- **`G` and `R`.** `G` is the saved state (JSON in `localStorage['final-call-save-v2']`). `R` is runtime only.
- **New and old saves.** `DEFAULT()` builds a new game. `resetAll(state)` loads and migrates any older save. When you add state, give it a default in `DEFAULT()` and handle its absence in `resetAll`. Never rename or remove saved fields, because old saves must keep loading.
- **Other localStorage keys:**
  - `final-call-topgap`: the phone camera band;
  - `final-call-cloud` and `final-call-device`: bookkeeping for saves across devices.

### Time

`update(dt)` advances game minutes. These hooks run from it:
- Every game minute: `updateBuilds`, `dayTick`, `checkLevel`, `fleetTick`.
- `managersTick` runs every 6 hours, `crewTick` every 30 minutes and `recordsHour` every hour. `nightChecks` runs at 03:00.
- `dayTick` runs `recordsDay`, `regionDay`, `rivalDay` and `chalDay`.

### Headless sim

- `R.sim=true` means:
  - no DOM work and no saving;
  - toasts resolve to their last choice.
- Everything reachable from `update()` must work that way.
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

- **Gating:** `has('kind:id')` (for example `up:desks`, `ac:3`, `rt:2`, `mode:hsr`, `feat:slots`) comes from approved Masterplan plans (`TECH`, 52 plans in 5 branches). Level unlocks come from `LEVELS`, which has 10 levels from Airfield to Airport of the Year.
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
