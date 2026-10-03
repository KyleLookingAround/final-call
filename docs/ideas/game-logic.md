---
type: Ideas
description: Ideas, not agreed, to improve the simulation, economy, pacing, demand, passengers, managers and how choices matter.
---
# Ideas: the game logic

Ideas to improve the simulation, economy, pacing, demand, passengers, managers and how choices matter. **Not agreed.** The owner picks. Nothing gets built without an issue and, for anything a player would notice, an approved spec. Written 27 Sep 2026 from `main` at version 30 (brief: `docs/briefs/game-logic-ideas.md`).

## Where the logic is weak today

### The evidence: the bot on seeds 1–3

`npm run bot -- 1150 --seed N`, keeping Classic, on `main`. No errors; every level `ok`, apart from level 5, which is `near` on all three (1–6% early, as the project notes expect since version 27).

| Level | Seed 1 | Seed 2 | Seed 3 | Mean gap from the level before |
| --- | --- | --- | --- | --- |
| 1 Local Airport | 40.3 | 35.5 | 36.6 | 37 h |
| 2 Regional Airport | 89.9 | 89.9 | 84.6 | 51 h |
| 3 City Airport | 104 | 102.3 | 99 | **16 h** |
| 4 International Airport | 202.6 | 205.7 | 195.1 | 99 h |
| 5 Gateway Airport | 327.2 | 335.7 | 319.5 | 126 h |
| 6 Major Hub | 461.8 | 470.9 | 449.4 | 133 h |
| 7 Global Hub | 638.8 | 653.6 | 632.4 | 181 h |
| 8 World Gateway | 872.1 | 879.1 | 865.8 | **233 h** |
| 9 Airport of the Year | 1100 | 1105.5 | 1091.5 | **227 h** |

The bot's six-hourly snapshots (in `build/bot-N.log`) show this on all three seeds:

1. **The rating is always full.** From hour 18–24 on, the rating never falls below 91 and sits at 95–100 on every snapshot. Late departures are the biggest loss (−10 to −32 in six hours late on), and noise costs something every night, but each on-time departure adds 2.5 (`src/game/08-stands.js:165`) and good queues add 1 more (`:168`), at 90% on time over hundreds of flights a day. The rating is a running sum of rewards and penalties clamped at 100 (`repAdj`, `src/game/05-flights.js:112`), so a big airport always pins it at the cap. The levels ask for 50–80 (`LEVELS`, `src/game/01-constants.js:78`); the bot beats that by 24–100% all game. So the rating never limits a level, the demand it feeds (`attract`, `src/game/03-state.js:67`) is always at its maximum, and so is the share it wins from Lowmere (`rivShare`, `src/game/33-lowmere.js:9`). Everything that costs rating (noise, stranded riders, crowded lines, lounges, missed bags) costs nothing in practice. The curfew policy is a choice with no downside to skip.
2. **From level 4, every level waits on one number.** Gates and passengers in the last 24 hours are met early. Passengers flown in total (`levelChecks`, `src/game/09-construction-levels-days.js:25`) is always the last requirement met. Between levels the game is a count going up.
3. **The last two levels are the longest and the emptiest.** Levels 7→9 take about 460 game hours, 40% of the run. Gates stop at 8 at level 7, so no gates are added. Every stand is busy on every snapshot (`idle 0`). The airport flies 13–16k seats a day into a market of 28–35k (`rsup`), and the market isn't the limit: stands are. Plans run out too: by the end the bot has approved 53–54 plans, all or nearly all of those outside the Layouts branch, with 0–2 points left unspent.
4. **Money piles up.** Cash never falls below $500 after hour 150 on any seed. It reaches $0.8–2.9M by the end, after buying Lowmere at level 8 on all three seeds. Running costs are about 16% of income over the run: wages $0.75M, upkeep $1.7M, other costs $1.8M and transport operations $1.4M, against about $35M in (seed 1). The on-time bonus alone ($4.4M, 20% of each punctual flight's takings) is three-quarters as much as fares ($5.8M).
5. **One choice always wins: the biggest plane.** All three seeds end with 21 W-300 widebodies and 2 freighters, nothing else. The dispatcher (`pickRoute`, `src/game/03-state.js:83`) sends each plane where it earns most per hour. A widebody's running cost on a short trip is scaled down (`routeOp`), and route load stays at 87–88%, so bigger always pays more per stand. The only limit on a stand is `fitsGate` (`src/game/01-constants.js:46`).
6. **Lowmere never threatens.** Your share of shared routes falls from 100% to 52–64% over the run, but with the rating pinned at 100 against Lowmere's 72 at most, it never costs a level. Every seed buys it at level 8.
7. **Partner airlines are filler.** A stand idle for 5 minutes (2 with the alliance) gets a partner flight (`src/game/05-flights.js:21`) however the airport treats partners. They pay $0.6M over the run, and nothing a player does changes whether they come.
8. **Weekly challenges are mostly missed.** Only 1–4 full sets in seven game weeks. Each goal is 112% of last week's pace (`chalDay`, `src/game/35-records.js:49`), and in the long flat stretches, where stands are the limit, that pace doesn't grow.
9. **Level 3 is a formality.** City Airport comes 16 hours after Regional Airport on every seed: by the time level 2 is reached, level 3's requirements are nearly met.

What works: queues stay short (average waits about 2 min at every gate late on), on-time holds at 90%, the terminal's parts don't jam, and the transport manager keeps lines paying. The simulation is sound. The weakness is that from level 4 very few choices change the outcome.

## The ideas, ranked

Each idea's size: **small** is one session; **medium** needs a spec; **large** is a bundle. "Sim cost" is extra work per step, against `perf`'s late-game budget on `main`.

### 1. A rating that reflects the last day

- **What the player notices:** the rating moves up and down with how the airport is doing today. A bad morning of fog and late departures shows on the rating by lunchtime, and a good week lifts it back. The rating chip shows an arrow and the day's biggest cause (`repRecent` already has the causes).
- **Rule change:** instead of adding each reward and penalty straight onto `G.rep`, `repAdj` adds them to a rolling score for the last 24 hours, weighted per flight or passenger. The rating eases each hour towards a target made from that score: for example 60 + 40 × (the day's net score ÷ flights), so what counts is the share of good and bad, not how many flights there were. Floors and caps stay. The level requirements stay as they are, but now they can bite.
- **Touches:** `repAdj` (`05-flights.js`), a step in `recordsHour` or `update`'s hourly hooks (`11-main-update.js`), the rating chip in `15-panel.js`. Every caller of `repAdj` keeps its call (`08-stands.js`, `26`–`28`, `39`, `45`–`47`); only the sizes may need tuning.
- **Risk:** high to the baselines, because the rating feeds demand (`attract`) and Lowmere's share. That is the point, so it needs a rebalance and, probably, new baselines agreed with the owner. Old saves: none (one new saved number, defaulted from `G.rep`).
- **Sim cost:** none (one sum per hour).
- **Size:** medium.

### 2. Airlines that choose you

- **What the player notices:** partner airlines have names and colours on the board and at the gates. Each has a mood from how its turnarounds go (on time, bags on board, gate waits). A happy airline adds a daily flight or a new city; an unhappy one warns on its gate card, then cuts a flight, then leaves. The Routes tab lists them. This is the "airlines that leave if treated badly" half of bundle 5.
- **Rule change:** replace "any stand idle for 5 minutes gets a partner" with a short list of partner airlines, each with daily slots at set times and a score that moves with each of their turnarounds. Handling fees rise with a happy airline's size. The alliance plan keeps its bigger cut. The duty manager can protect partners' stands when the player doesn't want the detail.
- **Touches:** `pickPartner` and the idle-stand rule (`05-flights.js`), the board (`14-board.js`), the gate cards, `rivalDay`'s neighbour `dayTick` for the daily review, a new `G.partners` with a default in `DEFAULT()` and `resetAll`.
- **Risk:** medium: partners are $0.6M of the $35M, but they also keep stands busy, so the fill rate early on needs watching. Old saves: new field, empty by default, filled on load.
- **Sim cost:** small (one score per turnaround).
- **Size:** medium, the first spec of bundle 5.

### 3. Levels that ask for something new

- **What the player notices:** from International Airport on, each level asks for one thing besides the counts, named on the goal bar: a long-haul route, a rail line to the airport, 85% on time over the last day, a rating of 75 over a day, a transfer share, Lowmere under 50% on a route. Levels 7–9 stop being a wait for a count to tick over.
- **Rule change:** add one `ask` per level from 4 in `LEVELS`, checked in `levelChecks` beside the others; cut the passengers-flown requirement for levels 7–9 by about a quarter so the pacing stays. An ask that isn't unlocked yet is hidden, not greyed. The recommendations and the advisor point at it for players who don't want the detail.
- **Touches:** `LEVELS` (`01-constants.js`), `levelChecks` and `checkLevel` (`09-construction-levels-days.js`), the goal bar and Office › Plan (`15-panel.js`), `lvlUnlocks` for the level-up card (`49-levelup.js`), the bot (to meet the asks).
- **Risk:** medium: pacing moves, and the bot has to learn each ask or the baselines break. Old saves: none (nothing saved; a save above a level keeps it).
- **Sim cost:** none.
- **Size:** medium.

### 4. Passengers who remember

- **What the player notices:** each city on the world map has a small ring for how its travellers feel about your airport, by kind (business, leisure, families, groups, those needing help). A bad experience (a missed connection, a long queue, lost bags) shows as a short-lived review on the airport map where it happened, and tapping it goes to the fix. A city whose business travellers are unhappy books fewer seats for a few days.
- **Rule change:** keep a decaying score per city and passenger kind (`rsOf` already decays per city each day), fed by the same events as the rating. `cityWill` multiplies by it (between 0.85 and 1.1). Reviews are drawn from the last hour's events, with a tap target.
- **Touches:** `rsOf` and `cityWill` (`03-state.js`), `PTYPE` (`05-flights.js`), the events in `08-stands.js`, `45-baggage.js` and `46-market.js`, the world map (`31-routes.js`) and a new drawing layer function (`50-scene.js`, `LAYER.top`). New passenger fields, if any, go in `seatPax`.
- **Risk:** medium to the baselines (demand moves); none to old saves (the scores start neutral).
- **Sim cost:** small in the simulation; the reviews are drawing only.
- **Size:** large: this is the core of bundle 4, and it works best after idea 1.

### 5. A mix of planes that pays

- **What the player notices:** a fleet of one type stops being best. Business routes fill better with more flights a day, widebodies take longer to turn round and fill slowly on short routes, and some stands can't take them. The fleet card shows which planes suit which routes.
- **Rule change:** three small rules. A route's willing travellers rise with flights a day for business-heavy cities (frequency value). Turnaround time grows with seats. `routeOp` stops discounting a big plane's running cost on a short trip as steeply. The dispatcher already follows money, so it will spread types by itself.
- **Touches:** `cityWill`, `routeOp` and `pickRoute` (`03-state.js`), turnaround timing in `08-stands.js`, the fleet card, and the bot's buying (it buys the best type only).
- **Risk:** high to the baselines, and the bot's fleet rule needs changing with it. None to old saves.
- **Sim cost:** none.
- **Size:** medium.

### 6. Costs that grow with the airport

- **What the player notices:** a big airport's running costs are a real share of its takings, so the Money tab matters late on: energy for the terminal by the hour, landing and navigation charges per movement, cleaning per passenger. The last levels have somewhere for money to go, and managers that save money earn their place.
- **Rule change:** add per-movement and per-passenger costs that start small and grow with level, aiming for running costs of about 30–35% of income at level 9 rather than 16%. Trim the on-time bonus from 20% to about 10% of a flight's takings. Show each on the day report.
- **Touches:** `update`'s spending (`11-main-update.js`), `upkeepRate` (`03-state.js`), the departure in `08-stands.js`, `revBy` categories (new ones default to 0), Office › Money.
- **Risk:** high to the baselines if it goes early; keep it from level 5 on to leave the first hours as they are. None to old saves.
- **Sim cost:** none.
- **Size:** small to medium.

### 7. Holding your level

- **What the player notices:** a level has to be kept. If the rating or the day's passengers fall below the current level's requirement for two days running, the level badge shows "Under review", and airlines and Lowmere react. A week under review and you drop a level, keeping everything built but losing what that level unlocked until you earn it back. This is the "able to fail" of bundle 5, without bankruptcy.
- **Rule change:** `checkLevel` also checks the current level's requirements each day; a review counter lives in `G`. Dropping a level never removes a building or a plane; it hides what the level unlocked for new purchases.
- **Touches:** `checkLevel` and `dayTick` (`09-construction-levels-days.js`), the level badge and goal bar (`15-panel.js`), `has()` gating (`02-masterplan.js`), the level-up card for a level earned back.
- **Risk:** low to the baselines (the bot rarely falls back), high to how the game feels. Needs idea 1 first, or it never fires. Old saves: one new field.
- **Sim cost:** none.
- **Size:** medium.

### 8. Lowmere that fights back

- **What the player notices:** Lowmere goes after your weak spots: routes where you run late or your rating has slipped, with sales timed for them. It can win a route outright (your planes then fly there half full), and it can be pushed out of a route by being better, as now. Its share line on the world map moves with each fight.
- **Rule change:** `rivalDay`'s route picks weigh your on-time rate and rating per route. Lowmere's rating rises with its size to about 80 instead of 72. Buying it costs more the stronger it is, so buying at level 8 stops being automatic.
- **Touches:** `rivalDay`, `rivShare` and `rivBuyCost` (`33-lowmere.js`), `rsOf` per-route on-time (`03-state.js`).
- **Risk:** medium to the baselines (shares and demand move). None to old saves.
- **Sim cost:** none (daily).
- **Size:** small, after idea 1. Bundle 6 builds on it.

### 9. A ground crew for the whole apron

- **What the player notices:** turnarounds share one ramp crew pool (cleaners, tugs, fuel, baggage handlers) instead of each stand being served at once. At a peak, the crew goes stand by stand, a waiting stand shows WAITING FOR RAMP on its card, and night shifts can be smaller. The fleet manager rosters it when the player doesn't want to.
- **Rule change:** the turnaround steps in `updateStand` take a crew from a pool sized by the ramp upgrades (`crew`, `tugs`, `handlers`) instead of all running in parallel. A roster by hour, like desks and lanes, with its wages.
- **Touches:** `updateStand` (`08-stands.js`), `derived` (`03-state.js`), the roster in `update` (`11-main-update.js`), Airfield's ramp section, the board.
- **Risk:** high to the baselines (on-time falls at peaks); tune with the bot. Old saves: roster settings default.
- **Sim cost:** small (a pool counter per step; no new objects).
- **Size:** large: the "ground crews and turnarounds" part of bundle 5.

### 10. Night flights that pay for their noise

- **What the player notices:** the night has its own traffic: freighters, red-eyes and mail flights with better fares and cargo rates after 23:00, against the noise that nearby towns hear. The curfew becomes a real choice, and the region map shows where the noise lands.
- **Rule change:** night fares and cargo rates up (for example +30%) for departures inside `nightWin`; night demand stays at 0.6× so only some routes pay. Noise already costs rating and slows towns; with idea 1 that cost is felt.
- **Touches:** `newFlight` and the cargo rate (`05-flights.js`), `demandNow` (`04-geometry.js`), `08-stands.js` noise, the region map's noise layer (`29-region-map.js`).
- **Risk:** low to medium to the baselines. None to old saves.
- **Sim cost:** none.
- **Size:** small, after idea 1. The "cargo and night flights" part of bundle 5.

### 11. Disruption days

- **What the player notices:** now and then (about once a game week, from level 4) a big day: a runway closed for works, an air-traffic strike abroad, a storm. The board fills with DIVERTED, DELAYED and CANCELLED, and the player (or the duty manager) chooses to hold, divert or cancel flights, with hotel rooms, buses and rating at stake.
- **Rule change:** a rare event in `fireEvent` with a plan of flights affected and two or three responses, each with a cost and a rating effect. Headless, it takes the last choice (the toast rule already does this).
- **Touches:** `fireEvent` (`10-events-toasts.js`), `newFlight`/`updateStand` for cancellations, the board (`14-board.js`), `hotelStranded` (`47-hotel.js`).
- **Risk:** medium; the bot must keep its runs repeatable (it does, through `rnd()`).
- **Sim cost:** none.
- **Size:** medium.

### 12. Challenges you can reach

- **What the player notices:** the weekly challenges come in three sizes, one easy, one fair and one a stretch, rather than three stretches. More weeks end with a plan point.
- **Rule change:** in `chalDay`, size the three at 95%, 110% and 130% of last week's pace instead of all at 112%, and take the pace from the best of the last two weeks.
- **Touches:** `chalDay` (`35-records.js`), the `rules` check.
- **Risk:** low: it pays a little more cash and a few more plan points, which the bot spends by level 7 anyway. None to old saves.
- **Sim cost:** none.
- **Size:** small.

## How they fit the owner's bundles

- **Bundle 4, "Passengers with a voice":** idea 4 is its core (kinds of passenger, reviews on the map, a heat map of where it hurts, a tap on a complaint to go to its fix). Idea 1 comes first: reviews that don't change anything would be text events, which the owner doesn't want.
- **Bundle 5, "A 24-hour airport with stakes":** ideas 2 (airlines that leave), 9 (ground crews and turnarounds), 10 (night flights and cargo), 11 (disruption days) and 7 (being able to fail). Idea 1 is what gives each of them teeth, and idea 6 keeps money tight enough for the stakes to show.
- **Bundle 6, "Hub and a second airport":** idea 8 is a step towards rivals; idea 5 (a mix of planes) matters for waves.
- **Before any bundle:** ideas 3 and 12 (pacing) and 6 (money) stand alone.
- **Existing "Ideas (not agreed)":** idea 6 fits beside "Fares that riders notice" (both make money choices matter). "Let the transport manager build" is unrelated. None is replaced.
- **Kept out:** seasons (parked) are already in the game and are left as they are; nothing here adds decor, eras, a sandbox, a share price or music.

## The top three

1. **A rating that reflects the last day (idea 1).** It's the keystone. Today the rating is full from the first day, so noise, crowded lines, missed bags, Lowmere and every rating penalty cost nothing, and the rating requirement never bites. Fixing it makes the existing systems matter without adding one, and bundles 4 and 5 both need it. It's a small surface (`repAdj` and an hourly step), but a real rebalance.
2. **Airlines that choose you (idea 2).** It is the owner's own ask in bundle 5 ("airlines that leave if treated badly"). It turns the partners from filler into customers with a visible mood on the board and gates, and gives a way to fail that shows at the gates rather than in text.
3. **Levels that ask for something new (idea 3).** It cures the longest dead stretch: levels 7–9 are 40% of the run with nothing to do but wait for passengers flown to tick over. It needs no new system, only an ask per level, and it can go first while the bigger ideas get specs.

Ideas 6 (costs that grow) and 12 (reachable challenges) are cheap companions to any of these.
