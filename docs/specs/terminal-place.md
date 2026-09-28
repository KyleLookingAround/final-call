# The terminal as a place

Issue: #48, refreshed for #133 · Status: Proposed (refreshed on 28 Sep 2026 for the owner to re-approve; the version approved on 27 Sep 2026 stands until then, and nothing new is built before approval) · PRs: #49 (the first spec), #113 (groundwork), this refresh; the rest added as they open

Bundle 3 of `docs/ROADMAP.md`, plus each layout's own terminal floor plan (step 3 of `docs/specs/terminal.md`). The owner loved the two-level terminal and the viewing terrace, said yes to windows and local character, and no to placing decor. On 28 Sep 2026 (#133) they asked for the whole thing as a "fully fleshed out feature overhaul": "Roof should also be a floor that's accessible so people can watch planes and celebs go up there and people take photos whilst waiting." This refresh makes the roof terrace a third floor passengers use, folds in what the last month changed, and re-measures the budgets on `main`. The checks still come first (experiment [D]).

**The owner's choices so far (#48, 27 Sep 2026), which stand:**
1. Two floors in every layout (the roof makes three stops, not three floors of halls).
2. Decor doesn't change the rating.
3. The terrace is a Terminal upgrade from level 3.
4. Floors are picked on the camera bar, never by zooming (`docs/decisions/ADR-2026-09-27-roof-is-a-floor.md`).
5. The drawing budget stays 0.55×.
6. One part draws the other eight layouts' floor plans, split in two only if its brief finds it too big.

**The owner's choices this refresh asks for** (each with the default taken if there's no answer; the `needs-owner` issue linked from #133 lists them): see "Choices for the owner" at the end.

## What the player gets

The terminal stops being one flat diagram. Departures are upstairs, arrivals below, with escalators and a lift between them, and above them a roof terrace passengers go up to while they wait: to watch the planes, take photos, get a coffee, and catch a glimpse of a famous face. Glass along the apron draws a crowd when a big jet taxis past. The halls carry the region's names and fill with planters, art and benches as the airport grows. Each layout gets a floor plan shaped to its own main building. The player places nothing: it all comes with the building.

## What they see

- **Three stops on the camera bar, at any zoom:** **Roof / Departures / Arrivals** (Dep and Arr under 560 px), already there since the groundwork (#113). Each shows a different floor, only in the airport view. Tapping a hall's name, an advisor tip or a board line flies the camera there and switches to its floor.
  - **Departures (upper):** check-in, security, the market place, the gate lounges, and the stairs and lift up to the terrace. Passengers reach the stands by the air bridges.
  - **Arrivals (lower):** immigration, reclaim, customs, the arrivals hall, the baggage hall and the hotel walkway.
  - **Between them:** escalators and a lift where the concourse meets both floors. Arriving passengers ride down; families and those who need help (`p.famL`) take the lift. A queue shows at a busy escalator.
  - **Roof:** the roofs, and once built the terrace cut into the roof at the apron edge. Two sides split by a glass screen: the **passengers' side** (airside, from the departures floor) with benches, a café kiosk and people at the rail; the **public side** (landside, by its own lift from the forecourt) with spotters and their cameras. Nothing inside the halls is drawn under the roof.
- **On the terrace:** waiting passengers lean on the rail, raise phones as a plane lands or pushes back, and drift back down when their gate is called. At night, camera flashes (cosmetic; still with reduced motion). Spotters crowd the public side when something rare arrives: a type not seen here this week, a new route's first arrival, or the biggest type you handle. Fewer at night; in rain, snow or a storm the passengers' side closes and the public side thins to a few die-hards. The crowd is the only sign: no toast, no text event.
- **Famous faces on the roof** (building on famous faces, #111): if the terrace is built and the celebrity has 40 minutes or more before their gate is called, they go up for a while with their gold ring. Photographers and fans gather on the public side against the glass, a clutch of passengers crowd the celebrity's end of the passengers' side, and the flashes go off. The existing crowd at check-in and security stays as it is.
- **Late runners on the roof:** a passenger on the terrace can be a dawdler like one in the shops. At final call they run: down the stairs (never the lift queue), then to the gate. The story card says so: "12:40 Up on the roof terrace", "12:52 Ran from the roof for gate 14", and if they miss, "Still on the roof when gate 14 closed".
- **Windows.** Glass along every airside wall on the departures floor that faces the apron (and the arrivals floor where a hall of it faces the apron), with a sheen by day, lit at night with warm pools on the apron. Waiting passengers drift to the glass when a wide-body taxis or pushes back nearby. Nobody misses a flight to watch.
- **Decor that comes with the building.** Planters, benches, art, a grand departures board and signs in every hall, more with each level, never in a queue, lane, doorway or walkway. The terrace gets its own: rail, benches, parasols, a telescope on the public side.
- **Local character.** Shops, cafés and art take names and colours from the region's places ("Castleton Kitchen", "Harbourgate Coffee", a Millbrook mural). The terrace café is named for a place too.
- **Each layout's own floor plan,** its terrace included: the Round terminal's halls wrap the landside half of the ring, Midfield's sit in its main terminal ahead of the train, the Satellite's and the Starfish's sit in their main buildings; the pier layouts fit Classic's plan to their own building's width. The people mover and the train run on the concourse, which is on both floors.
- **In the panel:** the terrace's card under Terminal › Staff: today's passengers up, spotters, takings, and its rating line. Nothing else new in the panel.
- **What's new:** each part a player would notice leaves one fragment in `src/updates.d/` in the card's shape (a lead, one sentence, a "Show me" target such as the floor stop or the terrace card, and a level: the terrace's is level 3).
- **Photo mode** works on every floor: the shutter keeps the floor shown, and Time and Sky dress the terrace like the rest of the map.
- **Screens:** the floor stops, the terrace card and the story card's roof lines fit a 320 px phone (portrait and landscape), clear of the camera band (Settings › Screen) and the bottom sheet's handle. Tablets and large screens show the same.

## How it works

- **Floors are a field on rooms** (built by the groundwork). A hall has `fl`: 0 arrivals, 1 departures, and now 2 for the terrace; a room without it (the concourse, the forecourt) is on floors 0 and 1. A **floor link** (`[hall, hall, x, y, half-width, 'esc'|'lift'|'stairs', people a minute]`) is a doorway between floors; passengers queue for it like a door, `p.famL` passengers take the lift, and routing (`route`, `walk`) treats it as a doorway. Bags never use floor links: the belts drop to the baggage hall.
- **The terrace is a room, not a count.** `ter` (`fl` 2) with a third floor link, stairs and a lift from the departures floor's airside (the market place, or the concourse where a layout has no market place over the apron). Its public side is drawn but not routed: spotters, fans and photographers never enter the terminal's rooms or queues.
- **Who goes up.** When `nextAct` would send a waiting passenger to a seat in the market place, 1 in 6 goes up instead if the terrace is built, open (not in rain, snow or a storm, from 06:00 to 22:00) and under its capacity (40 on the passengers' side). More go when a wide-body or a rare type is on the apron. They stay 10–30 minutes, and leave when their gate is called, like shoppers: `airside` sends them to the gate. A dawdler (`DAWDLE`, as late runners) lingers until final call and runs: stairs only, 1.8× pace, and the stairs' queue lets runners go first. This choice uses `rnd()` like the rest of `nextAct`, so `PLAY` changes.
- **Spotters stay a count.** `R.spot` (runtime) is now the public side only: it rises and falls with the hour, the weather and rare arrivals, and a sample of at most 40 is drawn. Passengers on the passengers' side are counted by their room, not in `R.spot`.
- **Famous faces.** With the terrace built and 40 minutes or more before their gate is called, the celebrity goes up for 10–20 minutes (`famousPax`'s passenger; one `rnd()` draw). While they're up, `R.spot` gains 6 photographers and 10 fans, and passengers on the terrace move to the celebrity's end. The landside crowd from famous faces is unchanged.
- **Earnings (within the 2% cap).** Two small sources, together at most 2% of a day's income at level 9: the terrace café kiosk, earned per passenger up through `earn(…,'shops',…,at)` like any café (and eligible for the famous face's busy hour), and a small charge on the public side, per spotter, through `earn(…,'landside',…)` like the hotel. The spec keeps the 2% cap: the terrace is a delight, not an income line, and income changes are on hold (#135, #136).
- **Its own rating line.** A new cause `terrace` in `REPWHY` and `REPLBL` ("The roof terrace"): each passenger who went up and then boarded on time gives +0.01, up to +0.4 a day; one who missed their flight from the roof takes −0.6 through the runners' existing `runner` cause (not twice). A crowded terrace (at capacity for over an hour) costs −0.1. Watchers and decor still don't touch the rating.
- **Windows** are edges of airside rooms on each floor that face the apron. A watcher is a passenger already waiting for their gate call, within reach of the glass on their own floor. They go, stay until the plane has passed, and go back, never after their gate is called.
- **Decor** is worked out from the layout's rooms, what's built and the level. Drawn only, never saved or placed, no effect on the rating.
- **Local names** come from `PLACES`, picked with a hash of the unit's index, not `rnd()`.
- **The view:** `R.floor` (`'roof'`, `'up'`, `'down'`) picks the floor drawn through `setFloor` (`53-roofs.js`). `onFloor(fl)` shows a room or passenger on the floor drawn; the roof stop now draws the terrace's room and its passengers (`fl` 2) as well as the roofs, and nothing else inside a hall. `paxEase`'s catch-up through `p.doors` (the wall fix of #127) includes floor links, so nobody is drawn sliding across a floor they're not on.
- **Unlocks:** two floors, windows, decor and local names from the start. The terrace is `G.lv.terrace`, from level 3, hidden before (the famous faces start at level 3 too). Each layout's plan comes with the layout.
- **Managers and recommendations:** nothing to manage. The advisor recommends the terrace once at level 3 when the market place is busy. The advisor's tips and the board's lines fly the camera to the right floor.
- **Fitting round the rest:** window lights use `LIGHTS` and `lamp()`; everything draws in the existing layers (`LAYER.terminal`, `pax`, `roofs`, `lit`), with no new lines in `draw()`; the terrace's weather follows `drawnFx()` and its lighting `drawnHour()`, so photo mode dresses it. A network you have to keep (#116) spreads flights thinner, so a check that needs an event (a final call, a rare arrival, a pushback) causes it rather than waiting for the traffic.

## Saved state

- `G.lv.terrace` (0 or 1), an upgrade key added with `Object.assign(UPG,{…})`: `DEFAULT().lv` gives 0 and `resetAll` fills missing keys.
- `G.terrace` (`FIELDS`: `()=>({d:0,up:0,take:0})`): today's passengers up and takings for the card. Older saves get the default; no migration step.
- A passenger's floor comes from their room; `p.fl` is set only while they ride a floor link. The floor shown, spotters, watchers, decor and local names are runtime or worked out.
- **Old saves:** each loads into its layout's plan. A passenger in a hall is put on that hall's floor, or at the nearest doorway on that floor if the hall moved. Nobody loads on the terrace from a save older than it. Nothing is renamed or removed.

## Balance

- **Walks change:** stacked halls, floor links, the terrace trip and each layout's plan change how far passengers walk, so queues, shop time and dawdlers shift. The pass mark is pacing within 15% of `tools/baseline.json` on seeds 1–3, keeping Classic and rebuilding. Every part that moves halls or passengers runs the Balance workflow (it runs when the PR leaves draft; add the `balance` label after later code changes).
- **The terrace takes passengers out of the market place,** so shop takings may dip a little; its café makes some back. Its income stays at most 2% of a day's income at level 9, and its rating at most +0.4 a day.
- **Late runners:** misses from the roof should be no likelier than from the shops; the terrace check holds it.
- If pacing leaves tolerance, the part stops and says so, and the PR that brings the parts together rebalances with the owner's word, as the terminal did.

## Speed budget

Measured on `main` (4c841dc) on 28 Sep 2026, this session's machine: three `scene` runs, three `plans` zoomed-in runs, one `perf` run.

| Check | `main` 27 Sep | `main` 28 Sep | Budget | Left |
| --- | --- | --- | --- | --- |
| Late-game simulation | 0.152× | 0.151× | 0.25× | 0.099× |
| Sixteen stands of Midfield | 0.129× | 0.248× | 0.375× | 0.127× |
| Phone at 8×, CPU slowed 4× | 7.2 of 8 game min/s | 6.9 | reported | |
| Phone at 8×, sixteen stands | 4.7 of 8 game min/s | 3.0 | reported | |
| `scene`, Classic, desktop | 0.297× | 0.331–0.353× (median 0.332×) | 0.55× | 0.218× |
| `scene`, Midfield, desktop | 0.351× | 0.324–0.383× (median 0.382×) | 0.55× | 0.168× |
| `scene`, Midfield, phone | 0.341× | 0.283–0.326× (median 0.318×) | 0.55× | 0.232× |
| Zoomed in, Classic, desktop | 0.22× | 0.176–0.207× (median 0.203×) | 0.33× | 0.127× |
| Zoomed in, Midfield, desktop | 0.252× | 0.243–0.263× (median 0.262×) | 0.378× | 0.116× |
| Zoomed in, Midfield, phone | 0.208× | 0.161–0.256× (median 0.226×) | 0.312× | 0.086× |

- **What moved in a day:** Midfield's simulation nearly doubled and the throttled phone at sixteen stands fell from 4.7 to 3.0 game minutes a second: the network you have to keep (#116), late runners and famous faces all run per passenger or per minute. The phone is now the tightest place, which is why refactor 7 goes first (see the order of work).
- **Drawing shares** of what's left in each scene (the tightest is the zoomed-in phone, 0.086×): two floors 25%, windows 15%, decor and local names 20%, the terrace floor 25% (real passengers, the public crowd and flashes), the floor plans 15%. The part's brief turns these into numbers from the medians on `main` when it starts.
- **Simulation shares:** two floors 0.02× (late game), windows 0.01×, the terrace 0.02× (passengers on a third floor, one more floor link), the floor plans 0.02× on Midfield. Decor and local names get none. Together 0.05× of the late game's 0.099× and 0.07× of Midfield's 0.127×, leaving room for refactor 7's measurement noise. The throttled phone at sixteen stands must not fall by more than 0.3 game minutes a second in any part.
- One run varies by about ±0.05× for drawing (the zoomed-in phone ranged 0.161–0.256× today) and ±0.02× for simulation. Each part measures the median of three runs on its branch against three on `main`, alternately, on the same machine, and puts both in its PR. The Parts workflow checks the open parts together.

## Checks

The pending mechanism is in place (`tools/check.mjs`, `tools/checks/pending.txt`, `docs/SYSTEMS.md` "Pending checks"): a pending check prints `PEND` while it fails and fails the run once it passes, so each part removes its own lines. Checks whose play takes seconds wait until their code exists; `TP_ALL=1` plays them anyway. A part may change a pre-written check only to fix a mistake, saying what and why; loosening a pass mark needs the coordinator. Each change is counted for [D].

**Guards, on now:** `scene: drawing never changes the game`, `scene: drawing speed` (three scenes), `scene: drawing speed, terminal zoomed in` (three scenes), both `perf` simulation checks, `saves`, `layout` (320 px to 2560 px), `layouts`, `terminal`, `roofs`, `late-runners`, `famous-faces`, `photo-mode`, `news-card`, `phone-bugs`, `movement`, and the groundwork's `plans` checks (every layout from its own table, rooms and doorways have floors, nothing drawn under the roof, the floor chip, the way through, two hours in every layout, old saves). They must stay green.

**Unchanged, still pending:** `scene: one floor at a time`; the seven `floors:` checks; the four `windows:` checks; the five `decor:` checks; `terrace: hidden until it can be built`, `spotters crowd for something rare`, `the crowd is the only sign`, `spotters stay on the roof`, `its card fits a phone`; `plans: halls inside each main building`, `no layout's walk is a trap`, `rebuilding moves people into the new plan`. Their setups and pass marks are as in the first spec (#49) and `tools/checks/*.mjs`.

**Changed** (the checks refresh rewrites them; the old names come out of `pending.txt` and the new ones go in):
- `terrace: seen at every zoom` becomes **`terrace: on the Roof at every zoom, and only there`**. Setup: bought, Classic, by day, `R.floor='roof'` zoomed out and at 1.6×, then `'up'` and `'down'`. Measure: pixels over the terrace against the roof's colour; passengers drawn whose room is `ter`. Pass: different from the roof at both zooms on the Roof; no terrace passengers drawn on the other two floors.
- `terrace: fewer at night and in rain` becomes **`terrace: fewer at night and in rain, and closed to passengers in the wet`**. Measure: `R.spot` at 02:00, and at 14:00 with rain on and off; passengers on the terrace after 20 minutes of rain. Pass: `R.spot` at most 2 at 02:00, rain at most half of dry; 0 passengers up in rain.
- `terrace: small takings` keeps its name. Measure: café and public-side takings together against the day's income. Pass: more than 0 and at most 2%, and both sources above 0.

**New:**
- `terrace: waiting passengers go up and come down`. Setup: `v29-L9.json` with the terrace, seed 1, 12:00–14:00, dry. Measure: passengers who reach `ter`; their floor changes; passengers on the terrace after their gate is called who aren't runners. Pass: at least 10 go up; every floor change within 12 units of the terrace's link; 0 left up after their call.
- `terrace: runners come down in time, or the story says why`. Setup: as above; make three terrace passengers dawdlers and bring their flight's final call forward (caused, not waited for). Measure: each one's floor link (stairs, not the lift), whether they board, and their story's last line. Pass: none takes the lift; each boards or their story names the roof.
- `terrace: a famous face goes up, and the fans follow`. Setup: famous faces' level 5 save with the terrace bought, the celebrity booked on a flight 90 minutes out (caused). Measure: the celebrity's room over the next hour, and `R.spot` before and while they're up. Pass: they reach `ter` and come down before their gate is called; `R.spot` rises by at least 12 while they're up.
- `terrace: its own line in the rating`. Setup: `v29-L9.json` with the terrace, one game day. Measure: `REPLBL.terrace`, and the rating moved by cause `terrace`. Pass: the label exists; the day's total is above 0 and at most +0.4.
- `floors: runners take the stairs or escalator`. Setup: `v29-L5.json`, seed 1, a dawdler caused on a flight whose gate is upstairs from where they wait. Measure: floor links used by runners. Pass: no runner queues for a lift.
- `floors: nobody is drawn through a floor`. Setup: as `floors: people change floor only on escalators and lifts`, drawing at 4× and 8×. Measure: `paxEase`'s drawn position for passengers changing floor. Pass: every drawn point between two floors lies within 12 units of a floor link (the wall fix of #127, extended to floors).

**CI's time limit (#132, #134).** A full run took about 14 minutes on the publish runner against a 15-minute limit; #134 raised `checks.yml` and `pages.yml` to 25 minutes, so there is room again, but not for careless groups. Measured locally today (each includes a sub-second build): the pending groups cost `floors` 2 s (43 s with `TP_ALL`), `windows` 2 s (5 s), `decor` 2 s (3 s), `terrace` 4 s (9 s), and `plans` 82 s either way. Switching everything on adds about 55 s locally before the new checks. So:
1. Each group plays one seeded page for all its checks, as `news-card` now does: `floors` must come down from 43 s to at most 20 s (one three-hour play for its play checks, not one each), and `terrace` stays at most 15 s with its new checks. Each part's PR says its group's run time locally and on CI.
2. The PR that brings the parts together must leave the full run no longer than `main`'s plus 90 s on CI, well inside 25 minutes. `plans` (82 s) is the biggest terminal group: the floor plans part plays the nine layouts in one page, not nine.
3. No workflow change is needed. If a full run on CI passes 20 minutes, the next part stops and the coordinator splits the run into two parallel jobs before it goes on.

**Screenshots:** `layouts` adds each layout's three stops at desktop size; each part adds its own at phone (390×844, 320×568), tablet and desktop, by day and night, zoomed out and at 1.6×.

**Measuring [D].** As in the first spec: each part's PR records (a) game-code bugs a pre-written check caught before it opened, (b) game-code bugs found after, and (c) pre-written checks it had to fix. The groundwork recorded one (c). [D] stays if (b) is at most 0.3 a part.

## Order of work

Each step opens one PR from `main`, in this order; a step starts once the one before it has merged unless it says otherwise. Parts are labelled `part:terminal-place`. Their briefs (`docs/briefs/terminal-place-*.md`) are rewritten after approval, with the measured shares.

1. **This spec** (#133 step 1). Owner approval.
2. **Checks refresh and refactor 7, side by side,** before any part:
   - **Checks refresh** (no game code): the changed and new checks above in `terrace.mjs` and `floors.mjs`; `floors` down to one play; `pending.txt` updated (see below). It shows each new check failing on `main` for the right reason.
   - **Refactor 7, one pass over passengers** (`docs/specs/systems-review.md`, step 7), two PRs each with `PLAY` identical: the per-state index and its readers, then the merged pass. **Why before the parts:** the throttled phone is now the tightest budget (3.0 of 8 game minutes a second), and the refactor is the one change expected to win it back; watchers and terrace visitors need "who is waiting" per floor, which the index gives cheaply instead of each part scanning `R.pax`; and the parts register into the three loops it merges, so running it while four parts are open is a merge risk for nothing. It touches no file the checks refresh does, so both run at once. It costs about a day before step 3.
3. **Two floors in Classic** (#133 step 2): halls stacked, escalators and the lift with queues, runners on the stairs, `paxEase` across floors, tapping a hall's name, old saves. Alone, since every later part stands on its floor links.
4. **Windows and watchers, and decor and local character** (#133 step 3), two parts side by side.
5. **The roof terrace floor** (#133 step 4): the terrace room and its link, who goes up, the public side and `R.spot`, famous faces on the roof, runners from the roof and their story lines, the café, the charge, the rating line, the card and the upgrade.
6. **Each layout's own floor plan** (#133 step 5), terrace included, for all eight other layouts; split into the pier layouts and the rest only if its brief finds it too big. May go to the cheaper model if its brief is routine.
7. **Bring it together** (#133 step 6): balance on seeds 1–3 keeping Classic and rebuilding, the speed of every part together, `pending.txt` left with comments only, the full run within `main`'s plus 90 s, screenshots of every layout's three stops by day and night, save fixtures, link previews, `docs/SYSTEMS.md`. Then the [D] look back.

One release a day, so the parts can ship one by one; each writes its own What's new fragment.

**`tools/checks/pending.txt` after the checks refresh** (written by step 2, not by this PR). Each part removes its own lines:

```
# needs halls on two floors: the two floors part
scene: one floor at a time

# two floors in Classic
floors: departures upstairs, arrivals below
floors: people change floor only on escalators and lifts
floors: families take the lift
floors: runners take the stairs or escalator
floors: nobody is stuck between floors
floors: nobody is drawn through a floor
floors: walks stay about the same
floors: tapping a hall goes to its floor
floors: old saves land on the right floor

# windows and watchers
windows: glass on every airside wall facing the apron
windows: passengers watch a big jet go by
windows: nobody watches after their gate is called
windows: lit at night

# decor and local character
decor: nothing to place
decor: it comes with the building
decor: never in the way
decor: local names from the region
decor: signs fit their halls

# the roof terrace floor
terrace: hidden until it can be built
terrace: on the Roof at every zoom, and only there
terrace: waiting passengers go up and come down
terrace: runners come down in time, or the story says why
terrace: spotters crowd for something rare
terrace: a famous face goes up, and the fans follow
terrace: fewer at night and in rain, and closed to passengers in the wet
terrace: the crowd is the only sign
terrace: spotters stay on the roof
terrace: small takings
terrace: its own line in the rating
terrace: its card fits a phone

# each layout's own floor plan
plans: halls inside each main building
plans: no layout's walk is a trap
plans: rebuilding moves people into the new plan
```

## Files

- **Checks refresh:** `tools/checks/terrace.mjs`, `tools/checks/floors.mjs` and `tools/checks/pending.txt`.
- **Refactor 7:** `07-passengers.js`, `08-stands.js`, `11-main-update.js`, `46-market.js`, as its own spec says.
- **Parts:** each in its own new file after the last one on `main`: floors, windows, decor, terrace and plans. They edit only the tables and hooks their briefs name; the terrace part adds one hook each to `46-market.js` (`nextAct`), `61-late-runners.js` (the stairs and story lines) and `64-famous-faces.js` (the celebrity going up).
- **Notes:** `docs/systems/terminal.md` and `airport-scene.md`, and a new file per part in `docs/systems/`.

## Left out

- Placing, moving or buying decor; decor that changes the rating.
- More than two floors of halls, mezzanines and cutaway views of two floors at once.
- Spotters as passengers with trips; arriving passengers on the terrace; a terrace ticket the player prices.
- Staff as people; kinds of passenger and their reviews (bundle 4).
- An isometric view; seasons.

## Choices for the owner

Each has a default, taken 12 hours after the question opens if there's no answer.

1. **The terrace's two sides** (passengers airside, the public landside by its own lift). Default: yes. Otherwise passengers only, with spotters drawn among them as a count.
2. **What it earns:** a café for passengers and a small charge on the public side, together at most 2% of a day's income. Default: both, capped at 2%. Otherwise the café only, or a higher cap (up to 4%) with the Balance workflow's word.
3. **Its rating line:** a small lift for passengers who went up and made their flight (at most +0.4 a day), a small cost when it's crowded. Default: yes. Otherwise no rating effect, like decor.
4. **Closed to passengers in rain, snow and storms.** Default: yes.
5. **Refactor 7 before the parts.** Default: yes, side by side with the checks refresh. Otherwise alongside the first parts.
