# Brief: Vehicles on the apron (a part of "Looks like a real airport")

The coordinator's brief for one part of `docs/specs/real-airport.md`, in the second batch, with the other of weather and vehicles, after the first batch has merged. It runs at the cheaper model (`create_session` with `model: "claude-sonnet-5"`), as experiment [C]. Start it as a fresh session with this file as its first message.

## Goal and what it may touch

- Draw vehicles working each turnaround: a tug at pushback, a fuel truck, a catering truck and baggage tractors with carts, driving between the stand and the service road, all from what the stand is doing (`F.plane.state`, `S.ext`, `F.hold`, `F.arr.unloaded`), never from new rules. Drawing only: no saved fields, no `rnd()`, no change to `G` or the game's side of `R`, and `PLAY` identical on seeds 1–3 against `main` (the Balance workflow shows it; the `scene` check proves drawing never changes the game).
- Branch `feature/real-airport-vehicles` from `main` (after the groundwork has merged), one PR, labelled `part:real-airport` so the Parts workflow checks it with the other open parts.
- Files and hooks it may touch: `src/game/55-vehicles.js` (new), adding to the `stands` layer; it may move the baggage cart drawn in `drawBridge` (`12-drawing.js`) into its file; it reads the stands' and flights' state only; its checks in `tools/checks/scene.mjs` or a new `tools/checks/vehicles.mjs` (vehicles only at stands with a turnaround, none at empty stands); its bullet in `docs/SYSTEMS.md`. Anything else is outside the brief.
- Add to the drawing layers (`LAYER.<name>.push(V=>…)`) and `LIGHTS` (`lamp()`) from `src/game/50-scene.js`; don't add lines to `draw()`. Leave the canvas as you found it (`ctx.save()`/`ctx.restore()`), skip what's off screen (`V.x0`…`V.y1`) and drop fine detail when zoomed out (`V.z`).
- Screenshots at phone (390×844), tablet (768×1024) and desktop (1440×900), by day and at night, zoomed out and in, for Classic and Midfield, looked at before the PR opens.

## Read first

- The project notes, then `node tools/graph.mjs 08-stands.js` and `node tools/graph.mjs 50-scene.js`, and only the files they list.
- `docs/specs/real-airport.md` (what it looks like, the layers, the speed budget), and in `docs/SYSTEMS.md` the drawing layers and stand frames.
- The functions it builds on: `drawBridge`, `drawStandApron`, `standCtx`, `paths()`, `ptAt`, `F.plane.state` and the turnaround in `08-stands.js`.

## Speed budget

0.035× of the drawing headroom (`npm run check -- scene`; the table is in `docs/specs/real-airport.md`), out of about 0.22× shared by the groundwork and five parts; the check fails over 0.55× in any scene. One run varies by about ±0.05×, so measure the median of three `scene` runs on the branch minus three on `main`, on the same machine, and put both in the PR. Simulation: none. It only draws, so both `perf` simulation checks stay where `main` has them (within ±0.02×).

## Commit author

KyleLookingAround <KyleMck10@hotmail.com> (the session-start hook sets it; check `git config user.email`).

## Who merges and when

The coordinator, one part at a time, after the Parts workflow's comment shows the open parts green together. The part opens its PR, subscribes to its events and ends its turn, and doesn't book its own check-ins.

## What's left for others

- Not the other parts of "Looks like a real airport" (apron markings and lighting, better planes, roofs, weather you can see, vehicles on the apron: whichever aren't this one), nor the last PR that brings them together (screenshots of every layout by day and night, the What's new entry and version, link previews, the speed of all five together).
- After the real airport merges, each in its own fresh session: faster CI (experiment [B]: cache Playwright's Chromium, and run only the check groups the graph says a change touches on draft PRs); "The terminal as a place" with its checks written before its code (experiment [D]); then the rest of `docs/ROADMAP.md`.
- Routine jobs (look backs, save fixtures, doc moves, screenshot reviews) go to the cheaper effort or model (experiment [C]).
- Pass this list on in any brief this session writes.

## When to stop and ask

- Only for something irreversible or outside this brief.
- Otherwise, if it truly needs the owner: open an issue labelled `needs-owner` with the question and the option it will take by default, carry on with other work, look at the issue at each stopping point, and take the default after 12 hours with no answer. Say so in the PR.
- Where it's merely unclear, take the safer option (easier to undo, or changing the game less) and say so in the PR.

## Cost budget

- Estimate: about $6 (one new file drawn from existing state; at the cheaper model).
- At each stopping point (the PR opened, CI back), read `get_session`: `usage.cost_usd` against the estimate (a 0 means not yet known, not free), and `rate_limit_info`. If status is "rejected" or `isUsingOverage` is true, schedule a `send_later` for a minute after `resetsAt` and end the turn.
- Past twice the estimate: say why in the PR and in `docs/LESSONS.md`, and trim or split what's left.
