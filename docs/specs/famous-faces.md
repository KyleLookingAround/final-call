# Famous faces

Issue: none (the owner's idea board, `docs/ideas/board-2026-09.md`, rated Love it) · Status: Approved (the owner's rating and the overnight brief, `docs/briefs/famous-faces.md`, stand in for approval) · PRs: (added as they open)

## What the player gets

Now and then someone famous flies from your airport. The day before, the board and the region news say who and roughly when; on the day, photographers wait at the check-in doors, fans line the barrier, and the café they stop at has a busy hour. Get their flight away on time and the rating gets a small lift; let it slip and it takes a small knock.

## What they see

- **The day before:** a gold line under the departures board, `★ TOMORROW ~14:00 · POP STAR LENA WRENFIELD`, and a Region news line: "Tomorrow: pop star Lena Wrenfield flies from here at about 14:00."
- **On the day:** the line reads `★ TODAY …`, then names the flight once they're booked on one (`★ NW214 · …`). That flight's row on the board shows a ★ before the city. A gold ring marks the celebrity walking through the terminal.
- **The crowd:** eight photographers (with flashes) on the pavement either side of the check-in doors, and fourteen fans (some with signs) along the check-in side of the security barrier, from when their flight is picked until 10 and 30 minutes after the celebrity is through security. A small cluster of fans stands outside the café or shop they visit during its busy hour.
- **The result:** a Region news line for the outcome, and the rating change shows in the Money tab's rating list as "Famous passengers".
- Phones (320 px and landscape), tablets and large screens: the board line is one line, ellipsised when narrow; it's only there on the day before and the day itself.

## How it works

- **When:** from level 3 (Regional Airport, `G.level>=2`). At each day change, if no visit is booked and the day has come round, a visit is booked for the next day: at levels 3–4 the next one comes 6–9 days later, at 5–6 after 4–7, from 7 after 3–5 (all through `rnd()`). The hour is between 08:00 and 19:00.
- **Who:** an invented first name and surname (or a royal's title and an invented realm) and a kind: footballer, pop star, film actor or royal. The lists are made up, and checked not to pair into well-known names.
- **The flight:** from the visit's hour, the earliest passenger flight at a stand leaving in the next 40–300 minutes, preferring one whose passengers are still arriving, carries them; one of its passengers (business class if there is one) is the celebrity. If none turns up by the end of the day, they go by car and the visit quietly lapses.
- **The busy hour:** the best café-type unit open (café, coffee cart, bar or restaurant, else any shop) takes 60% more on everything it earns for an hour after the flight is picked, paid through `earn(…,'shops',…,at)` with the flight's stand as the place.
- **The rating:** when the flight leaves, +1 if on time, −1 if late, through `repAdj(…,'famous',stand)`. A new cause `famous` in `REPWHY` and `REPLBL`.
- **Managers:** nothing to manage; the good gate running the managers already do pays off.

## Saved state

- One field, `G.famous` (`FIELDS`: `()=>({next:0,v:null})`): the day of the next booking and the booked visit `{d,t,who,kind}`. Older saves get the default. The crowd, the flight and the busy hour are runtime (`R.famous`), rebuilt after a load on the day.

## Balance

- A small, occasional boost: a few dollars of shop takings and ±1 rating every few days. Expected well inside 15% of `tools/baseline.json` on seeds 1–3.

## Checks

- `tools/checks/famous-faces.mjs`: over a seeded level 5 run, a visit is announced a day ahead (news and board line), the crowd appears and clears after departure, the shop bump and rating move through the ledger with their place, nothing throws with `R.sim`, and an older save without `famous` loads with the default.
- Screenshots: the board line and the crowd at phone and desktop sizes.

## Files

New `src/game/64-famous-faces.js`; one line in `14-board.js` (the ★ on the row), `03-state.js` (`FIELDS`), `src/shell.html` (the board line and its style).

## Left out

- Arriving celebrities, and photographers at arrivals (the owner's board mentions arrivals; departures carry the rating stake, so they come first).
- A tap-a-passenger card (Late runners hasn't merged).
- Any choice for the player (no VIP lane, no security detail).
