# Level-up screen

Issue: #29 · PRs: #30 · Status: Built. Approved (the owner's addition before bundle 2, approved in advance in the brief of 27 Sep 2026)

## What the player gets

Reaching a level is the game's big moment, but today it's a toast that fades. A card names the new level and lists only what it has just unlocked, each with a link straight to it, so the player knows what to try next.

## What they see

- A card like What's new's: "Now a City Airport", the cash reward and the plan points, then short groups:
  - **At the airport:** new gates and Pier B (Gates tab), more upgrade levels, named (each upgrade's tab);
  - **New plans in the Masterplan**, each with what it gives: upgrades, aircraft, routes and their cities, transport modes, layouts, sites and shops;
  - **Opens up:** the Region and the World map (level 1), Lowmere's airport and buying it, consultants, weekly challenges and the night-flights policy.
- Every line with somewhere to go is a link: the Masterplan, the Region, the World map, each upgrade's tab, each gate. Following one closes the card. A **Masterplan** button and a **Play** button sit at the foot.
- If two or more levels come at once (fast speeds, a welcome-back catch-up), one card covers them all: "Now a City Airport (two levels up)", with both levels' unlocks.
- It fits a 320 px phone (full width, scrolling inside), landscape phones and the camera band, like What's new.

## How it works

- `checkLevel` records the level-up; the card opens from the frame loop at its next UI tick, so levels reached together share one card. It never opens with `R.sim`, during the guided start, or with the setting off; then the level-up works as today (the toast).
- The unlocks come from the same data the game gates on: `STAND[i].lvl`, `PIER.lvl`, `CAPFRAC` through `capAt`, `TECH` tiers and `itemName`, `tabOpen`, `RIV_LV`, `RIV_BUY_LV`. Only what is new between the old level and the new one is listed; things still locked (a plan's contents before it's approved) show only as that plan's line.
- Opening pauses the game (`R.lvlPrev`, `setSpeed(0)`); closing with Escape, the close button, Play, a link or a tap outside puts the previous speed back, the same way What's new does.
- From the start; no plan unlocks it.

## Saved state

- `G.set.lvlCard` (true), a default in `DEFAULT().set`, merged into older saves by `resetAll`. A row in Settings › Notifications turns it off.
- Nothing is renamed or removed. The pending card is runtime only (`R.lvlCard`).

## Balance

None: UI only. The bot's play is unchanged on seeds 1–3 (its `STATE`, less the new setting and What's new's `G.seen`).

## Checks

A new group, `levelup` (`tools/checks/levelup.mjs`):
- it opens once on a level-up, pauses the game and puts the previous speed back;
- it lists only newly unlocked things (a Local Airport card names gate A3, the Region and the level-1 plans, and nothing from later levels);
- each link lands on the right tab (Masterplan, Region, World, an upgrade's tab, Gates);
- two levels at once make one card;
- the setting turns it off, and it never shows in the guided start or the headless sim;
- screenshots at phone, tablet and desktop sizes, looked at.

## Files

- New: `src/game/49-levelup.js`, `tools/checks/levelup.mjs`.
- `09-construction-levels-days.js`: `checkLevel` hands over to the card.
- `15-panel.js`: the setting's row. `03-state.js`: its default. `23-boot.js`: the card's tick. `src/shell.html`: the card.

## Left out

- A card for goals or plan approvals (they keep their toasts).
- Animation beyond the existing fanfare.
