---
type: Spec
description: A time-lapse of yesterday, played back over the airport in about a minute.
status: stable
verified: { by: human:KyleLookingAround, at: 2026-09-28T04:45:36Z }
---
# Day in a minute

Issue: none (the owner's idea board, `docs/ideas/board-2026-09.md`) · Status: Approved (rated Love it on the owner's board, third in their order; the brief of 27 Sep 2026 stands in for approval) · PRs: (added as they open)

## What the player gets

A time-lapse of yesterday at their airport, played back over the map in about a minute. It turns a day they mostly spent in menus into something to watch and share: the rush hours filling the stands, the halls glowing with crowds, the night falling.

## What they see

- **Office › Money**, under the day report: a **Yesterday in a minute** button, shown only once a day has been recorded (after a reload, the first day ends before it appears). Locked, it's hidden, not greyed out.
- **Playing.** The game pauses and the airport view zooms out to show it all. The lighting runs from midnight through dawn, day and dusk to night. Planes appear at their stands and leave, each in its airline's colour; the runway shows who's landing and taking off; the halls glow with crowd heat, warm where it's busy. Across the top: the clock, then the day's flights, passengers, on time and earnings ticking up as it goes.
- **Tap anywhere** (or Escape) to stop; it stops by itself at midnight. The camera, view and speed go back to how they were.
- On a 320 px phone the bar wraps to two lines and stays clear of the camera gap; the map above the sheet shows the playback. Tablets and large screens show the whole airport.

## How it works

- **Recording.** A `MINUTE` hook (`dayRec`, every 5 game minutes) reads what's on the airport right now into a small sample in `R.dim` (runtime): the clock, each stand's plane (aircraft type, airline colour, whether it's arriving, docked or leaving), the runway (queue lengths and the movement in progress), the queue lengths in check-in, security and passports, passengers in the terminal counted in a coarse grid for the heat, and the day so far (flights, passengers, on time, earnings). Samples are packed into typed arrays.
- **The ring.** Today and yesterday only: when the day changes, today's samples become yesterday's with its report (`G.lastDay`) and the day before is dropped. At most 300 samples a day; the check holds the whole recording under 2 MB.
- **Read only.** Nothing is recorded with `R.sim`, nothing goes in `G`, nothing calls `rnd()`. Playback only draws and reads.
- **Playback** draws over the live scene through the layers (`50-scene.js`): the hour and darkness come from a playback override (`R.dimT`) that `sceneView` reads, so the grade, the masts and the planes' lights follow the replayed clock. A wash on the `airfield`, `stands` and `pax` layers quiets what's live underneath, and the recorded planes, runway and heat are drawn over it.
- From the start; nothing unlocks it. No manager needed: it's something to watch.

## Saved state

- None. `R.dim` (the recording) and `R.dimT` (playback) are runtime only. Nothing is renamed or removed.

## Balance

- None: it reads and draws only. `PLAY` and `STATE` stay identical on seeds 1–3.

## Checks

- New group `day-in-a-minute`: after a seeded day the recording holds samples across the day, within its caps and 2 MB; nothing is recorded with `R.sim`; playback draws every frame without throwing on a phone and a desktop; `G` and the random stream are unchanged by recording and playback; tapping stops it and puts the speed back.
- `clocks`: the new hook's cadence and place re-recorded in `tools/checks/lib/clocks.json`.
- Screenshots: playback on a phone and a desktop.

## Files

New `src/game/63-day-in-a-minute.js`. One line each in `02-clocks.js` (the order), `50-scene.js` (the override) and `15-panel.js` (the button); the bar in `src/shell.html`.

## Left out

- Cars and trains in the region (not cheap enough to be worth it on the first cut), and individual passengers (the heat stands in for them).
- Saving the recording, sharing it as a video, and choosing another day than yesterday.
