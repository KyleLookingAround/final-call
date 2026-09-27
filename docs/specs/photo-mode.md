# Photo mode

Issue: none (the owner's idea board, `docs/ideas/board-2026-09.md`, rated Like) · Status: Approved · PRs: (added as they open)

Approved in advance by the owner's brief of 27 Sep 2026 (`docs/briefs/photo-mode.md`): their Like on the board and the instruction not to wait on them stand in for the approval.

## What the player gets

Players start sharing the game on 28 Sep. Photo mode lets them hide the panels, pick the time of day and the weather, frame their airport or region and save a clean picture of it to share, without changing their game.

## What they see

- A camera button in the view controls (the bar with the speeds, Region and Full screen) on tablets and larger screens. On a phone (up to 600 px wide) the top bar keeps its room, as the owner asked on 27 Sep 2026: **Photo mode** is a link at the top of How to play instead.
- Pressing it hides the board, the side panel, the phone sheet, the speed bar, the camera chips, toasts, the tip and the paused tag. The map fills the screen.
- A small bar at the foot of the screen, clear of the phone's home bar: **Time** (Now, Dawn, Noon, Dusk, Night), **Sky** (Now, Clear, Rain, Fog, Snow), **Pause**, a round **shutter**, and **Done**. Each of Time and Sky is one button that steps to the next choice, so the bar fits a 320 px phone in one row.
- Drag and pinch still frame the view. A tap on the map, **Done** or Esc leaves and brings every panel back as it was.
- The shutter flashes the screen and saves a PNG of the map at the screen's full resolution, with a small "FINAL CALL" mark in the bottom-right corner: a download on desktop, the share sheet on phones where sharing files works (a download where it doesn't).
- In the airport view Time sets the lighting pass (grade, darkness, the lights) and Sky sets the rain, puddles, snow, fog and windsock. In the Region Time sets the night over the land and its lit windows, and Sky lays rain, snow or fog over the map (the region's moving weather cells stay, as part of the map). On the world map the bar offers only Pause, the shutter and Done.

## How it works

- Available from the start; nothing to unlock.
- The drawn hour and weather are runtime overrides (`R.photo`), read only by drawing: `drawnHour()` (the lighting's hour; `darkness()` and `sceneView` read it) and `drawnFx()` (the weather's clocks; `54-weather.js` reads it). They are cleared on leaving. `G.clock`, `R.fx` and the simulation never change.
- Times: Dawn 06:36, Noon 12:00, Dusk 19:36, Night 23:00. Sky: Clear has no weather at all; Rain, Fog and Snow each show just that one.
- Pause pauses the game like the speed bar does; leaving puts the speed back as it was on entering.
- No managers or recommendations: it's a camera, not a system.

## Saved state

None. Photo mode is runtime only (`R.photo`); nothing in `G` changes and nothing is saved.

## Balance

None. Nothing reachable from `update()` changes: `PLAY` and `STATE` stay identical on seeds 1–3.

## Checks

A new group, `tools/checks/photo-mode.mjs`:
- entering hides every panel, chip, toast and the phone chrome at phone, tablet and desktop sizes, and leaves the bar and the map on screen;
- every time of day and every sky draws without throwing, in the airport view and the Region, and the drawn hour changes the lighting;
- the shutter makes a PNG the size of the canvas;
- leaving (Done, Esc and a tap) restores the panels and clears the overrides;
- `G` and the random stream are unchanged by entering, drawing every choice, the shutter and leaving.

Screenshots at 320 px, phone, tablet and desktop, in and out of photo mode.

## Files

A new `src/game/62-photo-mode.js`. One line each in `12-drawing.js` (`darkness()` reads `drawnHour()`) and `50-scene.js` (`sceneView` reads it); the weather's reads in `54-weather.js` go through `drawnFx()`. The button and the bar's CSS in `src/shell.html`.

## Left out

- No new weather or times beyond the four each; no drawn season.
- No filters, frames, captions or stickers beyond the corner mark.
- No saving photos inside the game or in the save.
- No photo of the panels or the board: the picture is the map alone.
