# Late runners, and a passenger's story

Issue: #99, from the owner's idea board (`docs/ideas/board-2026-09.md`, first in their order) · Status: Approved (the owner rated it Love it and the brief `docs/briefs/late-runners.md` approves this spec in advance) · PRs: see `docs/systems/late-runners.md`

## What the player gets

The last minutes before a departure get a little drama: passengers still airside at final call run for their gate, the gate holds for them briefly, and the board flips to GATE CLOSING. Anyone who doesn't make it costs a little rating. And every departing passenger now has a story: tap one to see who they are, where they've been today and how they feel about it.

## What they see

- **On the map:** runners move visibly faster, with speed lines behind them, eased like every other walker. The gate's badge shows GATE CLOSING in red while runners are on their way.
- **On the board:** the status flaps flip to GATE CLOSING (alternating GATE / CLOSING, since the column holds ten flaps).
- **The passenger card:** zoom in and tap a departing passenger on the airport view (not during the guided start). A small card over the map, top right under the speed buttons, with an amber ring on the passenger while it's open:
  - who: a name, where they're from, where they're going and why (a meeting in Frankfurt, a family holiday, a stag weekend);
  - today: up to eight lines with times ("07:12 Came by train", "07:20 Checked in at a desk, 6 min queue", "07:31 Through security, 9 min queue", "07:40 Coffee at the Coffee cart", "08:02 Ran for gate 14", "08:05 Made it on board");
  - a mood (Delighted, Happy, Fine, Fed up, Furious) and two or three plain sentences that tell the day.
  - It closes with its × button, a tap elsewhere, or leaving the airport view. It fits a 320 px phone (full width less the margins) and sits clear of the camera buttons.

## How it works

- **Final call** is 12 minutes before departure while the plane boards (the same moment shops send their last browsers out and security stops searching bags), or sooner once all but three of the flight's other passengers are aboard. From level 1, when a gate is called, 1 in 20 of its passengers in the shops or the market place lose track of time, a party together: shoppers browse up to 15 minutes more (and pay for it), and those in the market place linger without holding a seat until final call. From then, anyone of that flight walking to the gate runs: 1.8× their walking pace, never above 280 px a minute (the best walking pace) unless already faster (1.2× for passengers who need help).
- **GATE CLOSING** shows from 5 minutes before departure while any runner who could miss is on their way, so FINAL CALL (10 to 5 minutes) is still seen and announced.
- **Holding the gate:** a runner who started before the departure time can miss. Once everyone else is seated after the departure time, the gate holds 3 minutes (policy "Wait for them") or 1 minute ("Close on time"), then closes. Each runner still on the way misses: the flight goes without them and it costs 0.6 rating (a new cause, `runner`, at the stand). Their fare was never taken (fares are paid on sitting down). Bags stay as they are.
- Latecomers who reach the airside after the departure time (the existing late passenger, long queues) still run, but the gate waits for them as before.
- **Stories** are runtime only: a small record per passenger kept in a `WeakMap`, filled as they leave a handful of walking steps (`walkIn`, `bpGate`, `bpTap`, `repack`, `secOut`, `toShop`, `toMkt`, `toGate`), never per step for waiting passengers. Names and flavour come from the passenger's own `rand`, so they cost no `rnd()` and change nothing.
- From the start: no unlock. Nothing for managers to do; the policy "Late passengers" already chooses wait or close.

## Saved state

- None. Runners and stories live on the runtime side (`R`, a `WeakMap`); a load starts both afresh.

## Balance

- Missed runners are rare (a far gate, a long last shop); flights close a little earlier when the gate stops waiting. Expect `PLAY` to change slightly and the level hours to stay within 15% of `tools/baseline.json` on seeds 1–3.

## Checks

- New group `late-runners`: a runner appears at final call, runs faster than walking, and boards or misses; a flight with runners shows GATE CLOSING on the board; a missed runner is counted under `runner` at its stand; tapping a passenger opens the card with a timeline; a day in `R.sim` throws nothing.
- `movement` stays as it is: runners are capped under its top speed, and the easing smooths the change of pace.
- Screenshots: the card at phone and desktop sizes.

## Files

- New: `src/game/61-late-runners.js`, `tools/checks/late-runners.mjs`, `docs/systems/late-runners.md`.
- A registration line each: `14-board.js` (the status hook, and paging long statuses on the flaps), `13-camera.js` (a tap hook for the airport view), `12-drawing.js` (GATE CLOSING's colour). CSS in `src/shell.html`.

## Left out

- Stories for arriving passengers, saved stories, a log of past passengers, rebooking missed runners on a later flight.
