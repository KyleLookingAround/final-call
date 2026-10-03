---
type: System
description: The manager that runs transport lines by measuring what each change is worth.
verified: { by: process:notes-review, at: 2026-09-29T04:49:50Z }
---
# Transport manager

**Transport manager** (`32-managers.js`, on with `autoLines`, for lines without `L.man`).
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
- **The fleet recommendation** (`fleetRec`, release audit row 5): while partner airlines hold about one gate or more (`R.ptAvg`, smoothed over about two hours so it doesn't flicker) and you own under 1.6 planes a gate, buy another of the roomiest type you fly. Otherwise, for the smallest type you fly, the cheapest type that seats 30% more and flies as far, with the seats a round of flights gains; once you have 2 planes a gate, sell the small ones instead (the Fleet tab's Sell chip). It shows in Routes' Recommended card, and the advisor offers it as a tip.
- **Upgrades** are line builds with `up` (and `from`, the old code): the old line runs until the build finishes, then takes the new kind, number (reserved by `nextNum`) and colour.
