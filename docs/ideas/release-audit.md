# Release audit, 28 Sep 2026

What stands between Final Call and a polished public release, found by playing, measuring and reading (brief `docs/briefs/release-audit.md`). Five parts: the brain itch, bugs, balance, refactors, and easy wins. Nothing here is fixed in this session.

**How it was found.**
- Three scripted new games of 480 game hours each (two real hours at 4×), seed 1, 1440×900: one that only follows the tips and goals, one that also keeps about 1.7 planes a gate, and one that also ignores fare advice above 130%. Each took the Masterplan's recommended plan, followed the tip and the goal bar's link, and bought a gate the level checklist asked for. Plus the v32 level 3, 5 and 9 saves for 16 game hours each, before-and-after shots of purchases, and a phone pass.
- A bug hunt on the v32 saves: save round-trips, every setting and manager switched on and off, 240 hours of numbers sampled hourly, stuck passengers and planes over 48 hours, every tab, sub-tab and overlay at 1440 and 390.
- A polish sweep at 320×568, 390×844, 568×320, 768×1024 and 1440×900, on a new game and the level 3, 5 and 9 saves.
- `npm run check`, the bot on seeds 1–3 (1,150 hours), 1,350-hour runs to see level 9, a bisect of level 9 across #117 and #116, and seven policy variants.
- A read of `docs/specs/systems-review.md` Part 3 against the code.

Scripts, logs and screenshots are in the session's `build/audit/` (not committed): `itch/`, `bugs/`, `polish/shots/`, `balance/`.

## The brain itch, in short

The first two levels scratch it: ten goals done by hour 12, a gate shows its site and progress bar the moment it's bought, a new plane is at a gate within 30 game minutes, and levels come on the baselines' pace. **The itch stops at City Airport.** From there, the tip slot is a rating nag 59% of the time, the goal bar shows a level bar that counts levels rather than the requirement holding the player back, and nothing ever says the lever that matters: more or bigger planes. One tip, followed as written ("raise ticket prices to thin the crowds", repeated every hour), took fares to 300% and kept an airport at Regional for 440 hours. A player who does everything the game suggests sits at City Airport from hour 97 to hour 486 with $100–270k unspent. Levels 3–5 keep asking new things (a tram, linking lines, Pier B, long haul, 20 destinations); level 9 is saving up for landmarks at $2.5–12M with no new decision. Rows 1, 4, 5, 6, 9, 25–27 below are the itch's fixes; the late game is for the owner (O2, O3).

## The ranked list

Ranked by how much a player notices it against how small the fix is. **Batch** is the fix batch below; rows marked **owner** need the owner's call before a fix session takes them.

| # | Where | What's wrong | Fix | Size | Files | Proof | Batch |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Advisor tip, from Regional on, every size | When a rating cause's upgrades are all bought, the tip says "raise ticket prices to thin the crowds", every hour, with no limit: 20 taps took fares to 300% by hour 120, daily passengers fell from 4,077 to about 1,400 (City Airport needs 3,200), and the airport stayed Regional from hour 48 to 486. On the level 3 save, 300% fares cut daily passengers from 7,469 to 2,186 over 48 h for two points of rating. | Never advise a fare above about 120%; for late departures point at crews, planes or the level's gate cap instead of prices | small | `16-advisor.js` (`advise()`, the `REPWHY` fallback), `04-effects.js` (`REPWHY.late`) | A `rules` check: following every tip for 200 h from a new game never takes `G.fare` above 1.2; the scripted player (`build/audit/itch/fare.mjs`) reaches City Airport | F1 |
| 2 | Loading after time away, any level with income | **The "Welcome back" bonus snowballs.** It goes through `earn()`, so it lands in `R.minEarn` and the next minute's `G.rate` (835 → 58,987 after 5 s on the level 9 save). Leave two minutes and reload: $2.49M; again: $4.09M. A whole day's profit is about $1.31M. It also shows as "Last hour $3.80M" and a spike in Office › Money, and inflates the day's revenue and records. | Base the bonus on the median hourly revenue (`G.hours`), and keep it out of `R.minEarn` and the hour and day buckets | small | `23-boot.js` (`start()`) | A `saves` check: three loads 2 min apart pay no more than the first; `G.rate` unchanged by the bonus. PLAY identical (the bot never loads) | R1 |
| 3 | New game, every size, the first level-up | Level 1 comes at about 11:30 on day 1 (#117), but the guided start is still open (step 5 waits for an on-time flight), and `lvlUp()` won't open the card during the tour. **A newcomer's first level-up is a toast, never the card**, and on a phone the toast is under the coach box. | Queue the card during the tour and open it when the tour ends | small | `49-levelup.js` (`lvlUp`), `36-guided-start.js` (`tourNext`) | `levelup` check: a new game that follows the tour sees the card once, right after the tour; screenshot `polish/shots/lvl1-during-tour-p390.png` | P1 |
| 4 | Advisor tip, hour 35 to 486 | "Your rating fell N points…" is the tip for 198–246 of 481 hours (59% after City Airport), even at rating 80+ against a need of 60, crowding out every other tip. The number sums raw rating events, not the shown change: "fell 18" while the rating stayed at 66, "fell 15" while it rose from 73 to 75. | Show rating tips only when the rating is within about 10 of the next level's need, and quote the change in the rating shown | small | `16-advisor.js` (`advise()`), `04-effects.js` (`repRecent()`) | `rules`: the quoted fall equals the change in `G.rep` over the window; the scripted run's share of hours with a rating tip under 20% | F1 |
| 5 | City Airport to International, hour 97 to 486 | **A wall with no direction.** International needs 8,000 a day; the careful player sat at 5.2–6.1k for 389 game hours (97 real minutes at 4×) with 30–35 things affordable. No goal or tip ever says "more or bigger planes". The idle-gate tip ("more planes would fill it") fired 0 times in 481 h, because partner flights always fill the gates. The bot gets through by keeping 2–2.4 planes a gate and upgrading types. | A Fleet recommendation beside the route and transport ones ("Replace 3 R-48s with N-150s: +X seats a day"), and an idle-gate tip that counts gates held by partners | medium | `16-advisor.js`, `32-managers.js` (a fleet recommendation beside `recValue`) | The guidance-only scripted run reaches International within about 15% of the bot's level 4 hour; bot seeds 1–3 (the bot reads `advise()`) | F1 |
| 6 | Goal bar on a level goal, every size | "Become an International Airport" shows 75% because it counts levels (3 of 4) while daily passengers are 5.8k of 8k; what's holding the player back is one tap away, in Office › Levels | Make a level goal's text and bar follow its least-met requirement ("International Airport: 5,800 / 8,000 a day"), with a getter on `t` so the goal bar needs no change | small | `02-masterplan.js` (`GOALS` `l1`–`l9`) | A `rules` check on a level 3 save: the goal's `p()` is the least-met requirement; screenshot at 390 | F2 |
| 7 | Any size, any level | **One error freezes the game for good.** `frame()` (`23-boot.js`) calls `requestAnimationFrame` last with no guard, so a throw in `update`, `draw` or `refreshUI` stops the loop, and if the save causes it, every reload freezes too. Nothing on the frame's path (`update`, `draw`, `refreshUI`, `renderPanel`) catches an error. | Wrap the frame body in `try/finally` with `requestAnimationFrame` in `finally`; on the first error, pause and show a toast with Copy save | small | `23-boot.js` (`frame`) | A new check: `update` throws once, the loop keeps running and the save is untouched. PLAY identical (the sim never runs `frame`) | R1 |
| 8 | Office › Policies › Night flights, from level 1 **(owner: design)** | **The curfew locks progress.** Daily passengers drop about 25% and can't reach 8,000 (level 4) or 19,000 (level 6) at those levels' gate caps: seed 2 with a curfew stayed at level 3 from hour 146 to the end, over 1,000 hours, while cash piled up to $3.6M, with no warning | Default option: scale the daily requirement by the open hours (18/24) while the curfew is on, and say so on the policy card | small | `09-construction-levels-days.js` (`levelChecks`, the level-up test) | Curfew bot (`build/audit/balance/run-pol.mjs`) on seeds 1–2 reaches level 9 within 15%; default PLAY identical; a `rules` check that a curfew level 3 save with 4 gates can reach level 4 | F2 |
| 9 | Goal bar at City Airport, hours 186–486 | "Keep 55% of travellers on routes you share with Lowmere" goes in front of the level goal as soon as Lowmere opens, and sat at 13–29% for 300 hours. Its link opens a card with no button; the lever that helps (slot agreements) opens only at Gateway | Move `low1` after `l5`, or show the next goal too when the current one hasn't moved in 24 h | small | `02-masterplan.js` (`GOALS`, `curGoal()`) | The scripted run's goal bar never shows one goal for more than 100 h while another is completable | F2 |
| 10 | Office › Settings › Save, every size | **Load stops working after 3 s.** After the first tap it reads "Tap to replace this airport" and never resets; a tap after 3 s only re-arms it with the same label, so the airport is never replaced | Restore the label and clear `R.armKey` after 3 s, as Reset does; check the imported save's shape before `resetAll` | small | `15-panel.js` (the click handler's `loadSave` branch) | A `saves` check: paste, tap, wait 3.5 s, tap twice: loaded | P4 |
| 11 | Loading a save | A migration that throws leaves the state half-converted, and the 5-second autosave writes it over the good save | Put `resetAll` in a `try`; on failure copy the raw save to a `-broken` key and stop autosaving | small | `22-save.js`, `23-boot.js` (`start`) | A `saves` check with a bad fixture: the original key is unchanged byte for byte | R1 |
| 12 | Two tabs, or an old cached page | Last writer wins: two tabs overwrite each other, and an old cached page's first migration deletes upgrades it doesn't know, then autosaves. A full storage quota fails silently | Stop saving, with a toast, when another tab saved more recently; stamp the build and never overwrite a newer build's save; toast once when saving fails | small | `22-save.js` (`save`, `MIGRATIONS`) | A `saves` check with two pages on one storage. PLAY identical; STATE gains a field (`FIELDS`) | R1 |
| 13 | Guided start step 5, phones and 568×320 | No Next button, and it can wait 5–11 real minutes at 1× with the coach box over the map; in landscape it mentions "the board", which isn't shown there | Add Next (or dock the coach box to one line), and drop "the board" in landscape | small | `36-guided-start.js` (`TOUR`, `tourStep`) | `tour` check: step 5 has Next; screenshots `tour-p390-5.png`, `tour-l568-5.png` | P1 |
| 14 | Guided start step 3, phones | The step needs 4×, but the folded speed button goes 1→2→4: the first tap gives 2× and nothing says to tap again | Accept 2× or more for the step | small | `36-guided-start.js` (`TOUR[2].ok`) | `tour` check at 390 with the folded button | P1 |
| 15 | Guided start step 4, 320×568 | The spotlit desk button is at y 644, below the screen, and the coach box is cut off | Scroll the spotlit target into view when it's off-screen | small | `36-guided-start.js` (`tourStep`, `tourRect`) | `tour` check at 320: the spot is inside the viewport; `tour-p320-desk.png` | P1 |
| 16 | The bot, the Balance workflow and Health | **Level 9 is invisible.** The runs stop at 1,150 hours, below the baseline's upper end (1,160), so a level not reached prints "not run long enough", not `off`. On `main`, no seed reaches level 9 by 1,150; 1,350-hour runs put it at 1,154.8 (seed 1) and 1,194.8 (seed 2, `near`). Health issue #130 showed the same row and was closed on levels 1–7. | Run 1,200 hours, or count a level not reached by the end as `off` once the hours pass its lower bound | small | `tools/run-bot.mjs`, `tools/health.mjs` | Seeds 1–3 print a level 9 row | B1 |
| 17 | Level 8 to 9, hours 875–1,195 | The longest gap in the game (280–305 h). Level 9 wants 36,000 a day, but with all 8 stands built daily sits at 29–36k from hour 700 (mean 32.6k), so it fires only on a lucky peak; winter (hours 1,080–1,151, demand ×0.9) lands just as passengers cross 560k. Cash meanwhile grows from $0.25M to over $3M. #116 moved it about 40 h later on both seeds by shifting the dice, not by lowering the plateau much. | `LEVELS[9].req.daily` 36,000 → 34,000, so level 9 lands when passengers reach 560k | small | `01-constants.js` (`LEVELS`) | Bot seeds 1–3: row 9 inside 1,100–1,160, rows 1–8 identical | B1 |
| 18 | Office › Policies › Late passengers | **Closing on time always wins.** `late:'close'` reaches every level 7–11% sooner on seeds 1 and 2, with a higher rating (92 against 88): a −1.5 rating hit and one refund cost less than a delay | Straggler closed on: `repAdj(-1.5,'missed')` → −4, and refund twice the fare | small | `08-stands.js` (the straggler branch) | The policy bot with `late:'close'` within ±3% of the default on seeds 1–3; default PLAY identical | B1 |
| 19 | Airfield › Cargo sales, from level 3 | All five levels cost $14,250 together; from hour 186 to 282 it earned $157k, 71% of fares, after $2,250 of levels: a 1.5-hour payback | `UPG.cargo` base 150 → 600, mult 2 → 2.3 (about $60k in all) | small | `01-constants.js` (`UPG.cargo`) | Bot seeds 1–3, rows 5 and 7; **owner** if either moves more than 15% | B1 |
| 20 | Level 1 to 2, hours 4–83 | After #117's early first level, level 2 is 78–80 hours later: daily 1,500 is met at 54 h and passengers 2,000 at 64 h, then it waits for gate 3 ($3,000) until about 80 h, with cash at $100–600 | `STAND[2].cost` 3,000 → 2,000 and `LEVELS[2].req.pax` 2,000 → 1,600 | small | `01-constants.js` (`STAND`, `LEVELS`) | Bot seeds 1–3: level 2 at about 60–68 h, row 3 still in 95–117 | B1 |
| 21 | Level 6 to 7 | Widebodies (`n_wide`, 2 points) usually arrive only after level 7, and an N-222 fleet on 8 gates tops out at 24–27k a day against the 28,000 level 7 needs: seed 2 with ads sat at level 6 for 386 hours holding $2.8M | `LEVELS[7].req.daily` 28,000 → 26,000 | small | `01-constants.js` (`LEVELS`) | Bot seeds 1–3 and the seed 2 ads variant; **owner** if row 7 goes below 630 | B1 |
| 22 | RECORD and STAMP floaters, phones | Drawn at fixed map spots (760,120 and 760,150): behind the top bar on a 390 phone and off the map in landscape, so records and stamps ("First away", "Millionaire") go unseen | Draw them in screen space, or as a gold toast | small | `35-records.js` (`setRec`, `checkStamps`) | Screenshots `record-p390.png` against `record-d1440.png` | P2 |
| 23 | Sound and motion | Stamps, records, challenges and cash milestones below $1M are silent; goals, plan approvals and purchases all play the same kaching, and three goal toasts at the tour's end make three kachings | A chime for stamps and challenges, one kaching for goals that complete together | small | `35-records.js`, `06-sound.js` | `sound` check: a stamp and a challenge each play once | P2 |
| 24 | Settings › Screen and sound › Effects off | Tills and ticks stop, but the late-departure tone, the choice toast's `alertTone()` and the build-finished `fanfare()` still play | Check `sndFx` inside those tones in `06-sound.js` | small | `06-sound.js` (`alertTone`, `fanfare`, the late tone) | `sound` check: with effects off, a late departure, a choice toast and a finished build play nothing | P2 |
| 25 | Planes, every level | **Busywork: servicing.** "R-48s are overdue a service" was the tip for 63–116 hours a run, and one run serviced planes by hand 62 times: overnight checks only reach planes parked at base at 03:00, so planes that fly through the night are always overdue | Let overnight checks also service a plane at its next turnaround once its wear passes 8, and drop the tip while checks are on | small | `34-airline-operations.js` (overnight checks), `16-advisor.js` | Bot seeds 1–3 (servicing costs move); the scripted run's service tip hours | F1 |
| 26 | Advisor tip, level 5 and 9; hours 111–152 | Two tips that can't be acted on: "the coffee cart turned away 13 passengers. Upgrading it adds room" for a cart already at MAX (3 of 8 samples at level 9), and $2–6k upgrade tips that spent the cash for the goal "Open all four A gates" ($12k) for 40 hours | Only suggest an upgrade below its top level (else suggest a café or bar); hold back purchase tips that would leave the current purchase goal unaffordable | small | `16-advisor.js` (`cafeTip()`, `advise()`) | `rules`: no tip names a maxed upgrade over a level 9 day | F1 |
| 27 | Buying from a tip, desktop | Check-in desks bought from the tip are off-camera (the hall is below the visible map at 1440×900): the only feedback is a "−$63" pop | Pan the camera briefly to what was bought (desks, lanes, shops), using the camera's existing moves | small | `16-advisor.js` (the tip's click) | Screenshots before and 2 s after a tip purchase | F1 |
| 28 | Tab bar after level 1, a real new game | Three NEW badges, counts 1/5/7 and two new tabs arrive at once on an icon-only bar (the launch audit put this down to bot saves, but a real new game does it) | Mark NEW only the tabs that just opened; hide counts until the tab's first visit | small | `09-construction-levels-days.js` (`checkLevel`) | Screenshot `lvl1-during-tour-p390.png` against the fix | F2 |
| 29 | Board, 320 (the "Gate" header, back again) and 390 and desktop from level 5 | "GATE" is clipped into "STATUS" at 320 (30 px in 27); four-digit flight numbers ("NW1216") touch the city code; "+28" has no unit | Widen the gate and flight columns by one character; "+28 min" | small | `src/shell.html` (`.bcols`, `.brow`), `14-board.js` | Screenshots at 320, 390 and 1440 on the level 9 save | P3 |
| 30 | Side panel at 568×320, and the tab bar at 390 | At 568×320 cash is cut to "$499.…" (back again), chips ("YOUR ROUTES · 26", "Screen and sound") run past their borders, route tiles overflow, and tab badges cover the next icon. At 390 portrait the tab bar is icons only even with five tabs, so a newcomer can't tell Sales from Office | Give the side panel the narrow treatment below about 500 px; keep the tab labels while six tabs or fewer are open (`.tabs:has()`) | medium | `src/shell.html` (`.stat output`, `.segs .chip`, `.cnt`, the `side` container rules) | Screenshots at 568×320 on levels 3 and 5, and 390 on a new game | P3 |
| 31 | Top bar at 568×320 | Wraps to two rows and covers a third of the map; the cash and clock readout overlaps "PAUSED" and the tip | Keep the bar on one row; move the readout below it | medium | `src/shell.html` (`.hud`), `13-camera.js` | `topbar` check at 568×320; screenshot `sw-l568-L5-routes-new.png` | P3 |
| 32 | Terminal › Staff at 320, Sales › Prices at 568×320 | The stepper squeezes each row's text to 15 px (one word a line); the ticket-price text is 8 px wide and runs under the − button | Below 340 px of panel, put the stepper on its own line | small | `src/shell.html` (the stepper row) | Screenshots `el-p320-staff.png`, `el-l568-prices.png` | P3 |
| 33 | Bottom sheet, 320×568 and 375×667 | Fully open, the sheet shows about 100 px (320) or 197 px (375) of panel: the board, camera band, stats, goal and tabs take the rest | Past the first snap, fold the stats and goal into one line, or hide the board | medium | `19-bottom-sheet.js` (`sheetMax`), `src/shell.html` | `sheet` check: at least 240 px of panel at 320 when fully open | P3 |
| 34 | Help, touch screens | Still says "press P / W / R", has a Keyboard section, and a stray " · " before the hidden feedback link; its sections run long (Region is 80 words) | Hide the keyboard wording on touch, fix the separator, and shorten the sections (see "Shorter text") | small | `src/shell.html` (`#help`) | Screenshot of Help at 320 | P3 |
| 35 | Money everywhere | `money()` shows "$1000.0k" from 999,950 to 1M (cash passes through it on the way to $1M), "−$0" for tiny negatives, and "$200.0k", "$15.0k" | Choose the unit after rounding, treat values under half a cent as 0, drop a trailing ".0" | small | `03-state.js` (`money`) | A `rules` check on `money()` for 999,960, −0.004, 200,000 | P4 |
| 36 | Panel labels | "hold 0/70" means bags; "·0/0 off" has a stray dot | "bags 0/70"; drop the dot | small | `15-panel.js` (line 43), `12-drawing.js` (line 200) | Screenshot of the Gates tab on the level 5 save | P4 |
| 37 | Map, new game (owner's preference: hide locked items) | Locked stands are labelled "STAND A3 · Needs Local Airport" and "A4 · Needs City Airport" | Don't label stands above the current level | small | `12-drawing.js` (the stand label) | Screenshot `new-t768-m28.png` against the fix | P4 |
| 38 | Camera band, touch phones | Every touch phone gets a 40 px band, even in a normal browser tab and on phones without a notch | Default from `env(safe-area-inset-top)`; keep the setting | small | `15-panel.js` (`gapPref`) | Screenshots at 390 with and without a safe-area inset | P4 |
| 39 | Level-up card, level 4 | Lists 12 plans and 22 upgrade chips, a long scroll | Count upgrades by tab; list at most 5 plans plus "and N more" | small | `49-levelup.js` (`renderLvl`) | `levelup` check: the card fits 568×320 without scrolling past its footer | P1 |
| 40 | Masterplan gating | `has(key)` returns true for a key it doesn't know, so a typo shows a feature early instead of hiding it | A check that every literal `has('…')` key exists, and `has` false for an unknown key | small | `02-masterplan.js` (`has`) | The new `rules` check; PLAY identical | F2 |

### Shorter text

Each goes with the batch that owns its file.

| Now | Shorter | Batch |
| --- | --- | --- |
| Help › Region (80 words) | "Region (R): tap stations to draw lines. Good links bring flyers, carry commuters and grow towns. Events need lines that can move the crowds." | P3 |
| Help › Routes | "Routes (W): each city has a market. Open new routes when flights leave emptier." | P3 |
| Help › Managers | "Managers and recommendations run fares, timetables and upgrades for you. Change anything yourself and they leave it to you (Office › Settings)." | P3 |
| The 4× tip | "Try 4× to skip the quiet spells." | F1 |
| Tour step 5 | "Get a flight away on time. Punctual flights pay a bonus." | P1 |
| Tour step 6 | "Goals lead from here. Tips appear when something needs you." | P1 |
| Fleet note | "Planes take the next free gate and fly the best route in range (short hops about 60 min, long haul 3–4 h). Widebodies need Pier B." | P4 |
| Crews note | "Every departure needs a rested crew. Crews rest 12 h after about 10 h on duty." | P4 |
| Routes › New intro | "Each new route is a new market. Big cities want more seats; business cities pay more but fill less off-peak." | P4 |
| Layouts note | "A new layout opens at 03:00. Everything moves across; anything without room is sold." | P4 |

### For the owner, not a fix session

| # | Where | What's seen | The question, and the default |
| --- | --- | --- | --- |
| O1 | Departures board, level 3 on | **Planes leave hours before the time on the board.** Median departure against schedule: −7 min at level 1, −104 at 3, −108 at 5, −139 at 9 (worst tenth −201). `std` is set once at spawn from base rates; boarding starts when the turnaround ends and the plane closes when it's full. Board times stop meaning anything and "on time" is nearly automatic. | Set `std` from the gate call's own estimate (`boardEta` + 45), or hold closing until near `std`? Both move the rating and pacing beyond the baselines. Default: leave it for release, and take it with the next rating change. Files `05-flights.js`, `08-stands.js`, `46-market.js` (the last is the terminal's). |
| O2 | Levels 7–9 | The late game is saving up: at level 9, 0–2 things are affordable per tab; what's left is landmarks at $2.5M, $4M, $8M and $12M against $45–85k an hour, 300–600 game hours of waiting, and the last goals (`land3`, `land5`, `m50`) are all "wait for cash". Galleria, sustainable fuel, marketing 14–15 and the terminal roof never pay back. | New late decisions (landmark phases with a choice, contracts asking for a mix of routes or planes) are spec-sized. Default: after release, from the roadmap's ideas. |
| O3 | Level 8 | Nothing late adds capacity, so late cash can't buy progress (rows 17 and 21 are the small version). | A ninth stand or a pier extension at level 8 (about $1M) is new content and needs a spec. Default: after release. |
| O4 | From level 2 | Busywork: each shop unit is upgraded one tap per level (the Sales badge sits at 5–10) and planes are replaced one at a time; no manager covers either. | A "keep shops upgraded" switch for the duty manager and a "replace the oldest type" switch for the fleet manager: medium, and across two batches' files (`32-managers.js`, `15-panel.js`). Default: after release, with row 5's fleet recommendation as its first half. |
| O5 | Office › Policies › Staff pay | Close to cosmetic: good pay makes staff faster so fewer counters open, and wages rise only 1%; low pay raises wages 4%. | Charge `payMul` on the rate, or widen it to 0.7/1.4? Touches the wage lines in `11-main-update.js` and `43-departures.js` (the terminal's). Default: with the terminal's polish pass. |

Row 8 (the curfew) is also a design call; its default is written in the row, and a fix session takes it unless the owner says otherwise on #154 (needs-owner), which lists every owner row with its default. Rows 19 and 21 turn into owner rows only if the bot moves a level more than 15%.

### Left out, with reasons

- **Terminal advertising** earns +4% for a flat −0.8 an hour of rating that fades as traffic grows: within the bot's noise, and its hook is in `04-effects.js`, which F1 owns.
- **Staff pay, rush repair and overnight checks off**: within noise on seed 1 (O5 covers pay).
- **`bestFare()` computes a seat estimate it never uses** (`31-routes.js`): it rarely changes the fare picked; take it with the next routes change, since passing it would move PLAY.
- **The bot changes game state directly** (`tools/bot.js` lines 60–77 set fares, lines and stations on `G` itself) and copies the car-park cost formula: not player-visible, and fixing it moves the baselines.
- **Levels 3 and 8 idle with cash**: every upgrade is bought from about hour 186 to 234 (cash $108–146k), and from 770 h daily is met while passengers catch up; rows 17, 20 and 21 and O3 are the lever.

## Bugs: what else was checked

- `npm run check` on `main`: 346 of 347 passed, 34 pending (the terminal's pre-written checks). The one failure, `perf: late-game simulation`, was this sandbox under load from three bot runs and four review scripts; alone it passes (below).
- The bot on seeds 1–3: no errors; levels 1–7 inside the baselines (row 16 for level 9).
- The Health check workflow: four runs, all green as jobs. The last (28 Sep, on #116) found the `news` group timing out and opened #130, which was closed once #129 fixed that group; its level 9 row read "not run long enough" on every seed (row 16).
- Save round-trip: the level 1, 3, 5 and 9 saves each played 24 hours, saved and reloaded with nothing lost but the designed "planes back at base"; save code export and import gave no differences; a bad code shows its warning.
- Every setting and manager does what it says, on and off, over 48 hours (the one exception is row 24).
- 240 hours of numbers on the level 3 and 9 saves: no NaN, cash never negative, the rating stays in range and never jumps 15 in an hour, queues drain.
- No flight stuck after its departure time and every stand frees on the level 5 and 9 saves over 48 hours; no passenger stranded (the longest gate wait, 135 min, is O1's early gate call).
- No console or page errors on any tab, sub-tab or overlay at 1440 and 390, nor in any scripted run.

## Refactors

Steps 1–6 and 9 of `docs/specs/systems-review.md` Part 3 are on `main`; step 7 is running now and left out.

| Step or candidate | State on `main` | Before release? | Why |
| --- | --- | --- | --- |
| **Never freeze or lose a save** (rows 2, 7, 11, 12) | Nothing on the frame's path catches an error; autosave every 5 s from load; `resetAll` unguarded | **Yes, first** | The only refactor found whose failure a player would feel as lost progress; about 50 lines in two files nothing else is editing; PLAY identical |
| 8 Weather in one place | Mostly done: every write goes through `weather.*`; six reads still test `R.fx.<kind>>G.clock` directly (`04-geometry.js:48`, `07:32`, `39:183`, `43:49`, `43:191`, `47:73`) | No, after | Each read is the same test as `weather.on(k)`, so none can cause a bug; three of the files are the terminal's, so fold it into its polish pass |
| 9 Drawing as layers | Done (#113): `draw()` is `sceneView` plus the layer loop | – | – |
| 10 One value model for the managers | Not done: five separate rules (`recValue`, `bestFare`, `crewTarget`, `callLead`, `dutyPrice`) | No, after | A pure restructure with no player risk, and it touches `46` and `47` (two floors). One hazard for later: the managers' on/off settings are read three ways, and agree only because `22-save.js` fills every default |
| Money outside the ledger (`buy()` and sales in `15-panel.js`, the refund in `39-layouts.js`) | Purchases skip `effect()`, `hireCrew` doesn't | No, after | No bug today; write the rule in `docs/systems/effects.md` with the next change there |
| `15-panel.js` (423 lines, a 40-branch click handler) | – | No, after | Churn and merge risk, not bugs |
| `Math.random`, `Date.now`, DOM or saving reachable from `update()` | All cosmetic, UI-only or guarded by `R.sim` | Never | Nothing to fix |

## Speed: the release's baseline

`perf` and `scene` on `main` (095a068), run alone in this sandbox after the bots finished:

| Check | Result | Budget |
| --- | --- | --- |
| perf: late-game simulation, transport manager reviewing | 7.65 ms a game minute, 0.154× calibration | 0.25× |
| perf: sixteen stands of Midfield concourses | 14.41 ms a game minute, 0.329× | 0.375× (the least headroom: 12%) |
| perf: phone at 8×, CPU slowed 4× | 6.6 of 8 game minutes a second, game code 50% of the CPU | – |
| perf: phone at 8×, CPU slowed 4×, sixteen stands | 3.2 of 8 game minutes a second, 66% | – |
| scene: Classic, desktop | 22.94 ms a frame, 0.291× | 0.55× |
| scene: Midfield, desktop | 20.97 ms a frame, 0.271× | 0.55× |
| scene: Midfield, phone | 22.03 ms a frame, 0.356× | 0.55× |
| scene: terminal zoomed in, Classic, desktop | 13.93 ms, 0.205× (2,235 passengers) | 0.33× |
| scene: terminal zoomed in, Midfield, desktop / phone | 18.25 ms, 0.26× / 15.13 ms, 0.197× (3,004 passengers) | 0.378× / 0.312× |

## Terminal halls and floors: for the terminal's polish pass

- Labels inside the terminal ("UNIT TO LET", "MARKET PLACE", "BAGGAGE HALL") are about 6 px on phones and tablets and can't be read.
- On phones the stand row covers the check-in and entrance labels at the foot of the terminal.
- The concourse units stayed coffee carts at their top level through level 9 in every run; nothing suggests a better shop for the prime units.
- Step 8's last six direct weather reads (`39`, `43`, `47`), step 10 (`46`, `47`), O1's gate call (`46`) and O5's wages (`43`) are all in the terminal's files.

## Fix batches

No two batches share a file. Run them in this order: the refactor in a quiet window, then balance and fixes, then polish. The polish batches touching `src/shell.html` wait until two floors in Classic merges, since it adds its floor chip there.

| Batch | Kind | Rows | Files | Issue |
| --- | --- | --- | --- | --- |
| **R1 Never freeze or lose a save** | refactor | 7, 11, 12, 2 | `22-save.js`, `23-boot.js` | #146 |
| **B1 Level pacing and payoffs** | balance | 16 (first: it's how the rest are measured), 17, 18, 19, 20, 21 | `01-constants.js`, `08-stands.js`, `tools/run-bot.mjs`, `tools/health.mjs` | #147 |
| **F1 Tips that point the right way** | fix | 1, 4, 5, 26, 25, 27, and the 4× tip's text | `16-advisor.js`, `04-effects.js`, `32-managers.js`, `34-airline-operations.js` | #148 |
| **F2 Goals and levels that lead** | fix | 6, 9, 8 (owner's default), 28, 40 | `02-masterplan.js`, `09-construction-levels-days.js` | #149 |
| **P1 The first level-up and the guided start** | polish | 3, 13, 14, 15, 39, and the tour's text | `36-guided-start.js`, `49-levelup.js` | #150 |
| **P2 Moments you can hear and see** | polish | 22, 23, 24 | `35-records.js`, `06-sound.js` | #151 |
| **P3 Small screens and landscape** | polish | 29, 30, 31, 32, 33, 34, and Help's text | `src/shell.html`, `13-camera.js`, `14-board.js`, `19-bottom-sheet.js` | #152 |
| **P4 Numbers, labels and the save panel** | polish | 10, 35, 36, 37, 38, and the panel notes' text | `03-state.js`, `15-panel.js`, `12-drawing.js` | #153 |

- **R1** changes no play (PLAY identical on seeds 1–3; STATE gains the build stamp); write its `saves` checks first. Nothing planned edits these files.
- **B1** changes pacing on purpose: row 16 first, then each change on its own with seeds 1–3, and the Balance workflow's tables in the PR. Rows 19 and 21 stop for the owner if a level moves beyond 15%. Refactor 7 (one pass over passengers, running now) edits `08-stands.js`, so B1 starts after it merges.
- **F1** changes play (the bot reads `advise()`): seeds 1–3 before and after. Row 5 is the medium one; if it grows, ship the rest first.
- **F2** leaves PLAY as it is on seeds 1–3: goals are checked in the frame loop, which the bot doesn't run, and row 8 changes play only with the curfew on. Row 28 may change STATE (`G.newTabs`).
- **P1** is the one to do first among the polish: row 3 is every newcomer's first level-up.
