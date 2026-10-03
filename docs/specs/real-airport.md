---
type: Spec
description: "The airport looks like a real one: markings, planes, roofs, weather and vehicles."
status: stable
verified: { by: human:KyleLookingAround, at: 2026-09-27T11:30:45Z }
---
# Looks like a real airport

Issue: #37 · Status: Approved (the owner approved it in advance, in the brief of 27 Sep 2026, `docs/briefs/real-airport.md`) · Built (version 31) · PRs: groundwork #38; parts #53 markings, #50 planes, #52 roofs (and #63), #61 weather, #55 vehicles; brought together in the version 31 PR

## What the player gets

The airport looks like a real one seen from above, not a diagram: painted apron markings, day and night with lights that come on at dusk, roofs over the terminal that you step up to as a floor, planes with engines, shadows and their airline's tail, weather you can see on the ground, and vehicles working the turnarounds. It stays a top-down view, not isometric, and it changes nothing about how the game plays.

## What they see

- **Apron markings.** Yellow lead-in lines curving onto each stand, stop bars and stand numbers painted on the ground, red safety lines round each stand, taxiway centre lines with blue edge lights, runway threshold and aiming-point markings.
- **Day and night.** A dawn and dusk colour grade (warm, then blue) on top of today's darkness curve; floodlight masts on the apron that light up at dusk; lit windows in the terminal; runway and taxiway edge lights; planes' navigation and beacon lights at night.
- **Roofs.** On the roof, the terminal and its piers have roofs (with plant, skylights and the layout's own shape), so the airport reads as buildings. Changed on 27 Sep 2026 by the owner: the halls and passengers are never covered on their own; the roof is a floor the player steps up to with the **Roof** button on the map's camera bar, at any zoom (it replaced the zoom fade and #51's move of it; `docs/decisions/ADR-2026-09-27-roof-is-a-floor.md`). Hidden rooms (not yet built) have no roof.
- **Better planes.** Engines under the wings, a shadow on the apron, the airline's colour on the tail and engines, wingtip lights at night; the same on the runway's small planes.
- **Weather you can see.** Rain streaks and puddles that shine under the lights, snow that settles on the apron and grass and is cleared from stands, fog banks, cloud shadows drifting over, and a windsock.
- **Vehicles on the apron.** A tug at pushback, a fuel truck, a catering truck and baggage tractors with carts at each turnaround, driving between the stand and the service road. They come from what the stand is doing, not from new rules.
- Works the same on a 320 px phone, a landscape phone, a tablet and a large screen; detail that can't be seen at the current zoom isn't drawn.
- Nothing new in the panel. Settings › Screen may gain a "Detail: full / light" switch if a part needs it for slow phones (see Speed budget).

## How it works

- **Drawing only.** Every part draws from the game's existing state (`G`, `R`, each flight's plane state) and never changes it. No saved fields, no `rnd()`, no change to `PLAY` on seeds 1–3. Anything animated runs off the frame's time.
- **Drawing layers** (`src/game/50-scene.js`). The airport view draws bottom to top in named layers: `airfield`, `apron`, `stands`, `bridges`, `lit`, `terminal`, `landside`, `pax`, `roofs`, `signs`, `weather`, `top`. A part adds a function to a layer (`LAYER.apron.push(V=>…)`), not a line in `draw()`. Each gets the frame's view `V`: what's on screen (`x0`, `x1`, `y0`, `y1`), the scale and zoom (`k`, `z`), seconds (`t`), the darkness (`d`), the hour and `derived()`.
- **The lighting pass.** By night it darkens the apron and forecourt, then draws every light added to `LIGHTS` with `lamp(x,y,r,rgb,a)` additively. The stands' floodlights are the first lights; a part adds its own the same way and skips what's off screen.
- **Unlocks.** From the start: it's how the airport looks. Things drawn follow what's built (masts per built stand, runway lights with the runway).
- **Managers and recommendations:** nothing to manage.

## Saved state

None. No new fields in `G`; nothing renamed or removed.

## Balance

No effect. `PLAY` stays identical on seeds 1–3 against `main` for every part, and the `scene` check proves drawing never changes the game.

## Speed budget

Measured on `main` before the groundwork (`npm run check -- perf`, 27 Sep 2026):

| Check | `main` | Budget | Headroom |
| --- | --- | --- | --- |
| Late-game simulation | 0.115× | 0.25× | 0.135× |
| Sixteen stands of Midfield | 0.244× | 0.375× | 0.131× |
| Phone at 8×, CPU slowed 4× | 7.9 of 8 game min/s | reported | |
| Phone at 8×, sixteen stands | 5.3 of 8 game min/s | reported | |
| Drawing a frame, worst scene (`scene`) | 0.30–0.36× | 0.55× | about 0.22× |

The simulation's headroom is not shared out: the parts only draw, so each leaves both simulation checks where `main` has them (within noise, about ±0.02×). What they spend is drawing time. The groundwork added a `scene` check that times a frame of the worst scene (fully built, the whole airport in view, at night in a storm with fog and snow) for Classic and Midfield on a desktop and Midfield on a phone. `main` draws it in 0.30–0.36× of the calibration run (about 20 ms on the check machine, with software painting); the budget is 0.55×, about 1.6 times that. The headroom of about 0.22× is shared:

| Share of the drawing headroom | Budget |
| --- | --- |
| Groundwork (layers and lighting pass; at most a fifth) | 0.044× (it used none measurably) |
| Apron markings and lighting | 0.040× |
| Better planes | 0.035× |
| Roofs | 0.030× |
| Weather you can see | 0.035× |
| Vehicles on the apron | 0.035× |

One run varies by about ±0.05×, so a part measures its cost as the median of three `npm run check -- scene` runs on its branch minus three on `main`, on the same machine, and puts both in its PR. Tricks that keep within a share: cache static drawing (markings, roofs) in an offscreen canvas redrawn only when the layout or what's built changes; skip what's off screen (`V`); drop fine detail when zoomed out (`V.z`). The Parts workflow runs `scene` with every open part in, so the shares are checked together as well as alone.

## Checks

- The `scene` group (`tools/checks/scene.mjs`): every layer draws once a frame, in order, and only in the airport view; the lighting pass darkens the apron at night and a lamp lights its spot; drawing never changes the game (the same seed plays the same with frames drawn as without); drawing speed in three scenes against the budget.
- Each part adds its own checks to `scene` or its own file in `tools/checks/`: markings present on built stands only; roofs drawn only on the roof floor, at any zoom, never over a room not yet built; lights only at night; vehicles only at stands with a turnaround; weather drawn only while it's on (`R.fx`).
- Screenshots: `shots` plus each part's own at phone, tablet and desktop, by day, at dusk and at night, zoomed out and in.

## Order of work

1. **Groundwork** (one PR, merged on its own, `PLAY` unchanged): the layers, `V`, the lighting pass with `LIGHTS` and `lamp()`, the `scene` check group and budget, this spec and the parts' briefs.
2. **First batch, three parts side by side**, each from `main` after the groundwork merges, labelled `part:real-airport`:
   - apron markings and lighting (`docs/briefs/real-airport-markings.md`);
   - better planes (`docs/briefs/real-airport-planes.md`);
   - roofs (`docs/briefs/real-airport-roofs.md`).
3. **Second batch, two parts:** weather you can see (`docs/briefs/real-airport-weather.md`) and vehicles on the apron (`docs/briefs/real-airport-vehicles.md`). Both at the cheaper model (experiment [C]). The owner chose on 27 Sep 2026 to run this batch alongside the first instead of after it merges.
4. **Bring it together** in one last PR: screenshots of every layout by day and night, the What's new entry and version, link previews (`npm run preview`), `docs/SYSTEMS.md`, and the speed of all five parts together against the budget.

## Files

`src/game/50-scene.js` (new: layers, view, lighting pass) and `12-drawing.js` (`draw()` calls the layers). Each part adds its own numbered file before `99-start.js` (51 to 55) and may edit only the drawing code its brief names.

## Left out

Isometric or 3D views; placing decor (rejected); seasons and winter scenes (parked); passengers' look (bundle 4); the terminal's inside (bundle 3, "The terminal as a place"); any new setting unless a part needs a lighter mode for slow phones.
