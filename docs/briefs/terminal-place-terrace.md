# Brief: The roof terrace floor (a part of "The terminal as a place", #133 step 4)

The coordinator's brief for step 5 of `docs/specs/terminal-place.md`'s order of work (spec approved on #139, 28 Sep 2026). Two floors in Classic (#162) and refactor 7 (#145, #156) have merged. The owner parked the public launch on 29 Sep, so the launch week's 48-hour hold doesn't apply, and moved the terrace ahead of windows and decor: "the owner cares most about it".

## Goal and what it may touch

- Build the roof terrace exactly as the spec's "What they see", "How it works", "Saved state" and "Balance" sections say:
  - the `ter` room (`fl` 2), with stairs and a lift from the departures floor's airside;
  - who goes up, and runners from the roof with their story lines;
  - the public side and `R.spot`, famous faces on the roof, and closing in the wet and at night;
  - the café and the public-side charge (together at most 2% of a day's income at level 9);
  - the `terrace` rating line (at most +0.4 a day), and the card under Terminal › Staff;
  - the upgrade `G.lv.terrace` from level 3, hidden before, and the advisor's one tip;
  - one What's new fragment in `src/updates.d/` (level 3, "Show me" the terrace card or the Roof stop).
  Classic only; each layout's own plan (terrace included) is the floor plans part, later. On other layouts the terrace must be hidden or safely absent: no crash, no passengers routed to a room that isn't there.
- Switch on all twelve `terrace:` checks by taking their lines out of `tools/checks/pending.txt`. Say in the PR how each one failed on `main` and passes now. Keep the `terrace` group at most 15 s locally, one seeded page for all its checks (spec, "CI's time limit").
- Branch `feature/terminal-place-terrace` from `main`, one PR, labelled `part:terminal-place`, closing nothing (#133 stays open for the later steps).
- **Files and hooks it may touch:**
  - a new `src/game/67-terrace.js`;
  - one hook each in `46-market.js` (`nextAct`), `61-late-runners.js` (the stairs and story lines) and `64-famous-faces.js` (the celebrity going up);
  - the `ter` room and its floor link where Classic's rooms and links are defined (`39-layouts.js`, `42-terminal.js` or `66-floors.js`, whichever holds them);
  - `REPWHY`/`REPLBL`, `UPG` (via `Object.assign`) and one `FIELDS` line (`G.terrace`);
  - the Staff card through the panel's existing hooks, and the advisor's tip table;
  - `53-roofs.js`'s `onFloor` only as far as drawing `fl` 2 on the Roof stop needs;
  - `tools/checks/terrace.mjs` only to fix a mistake (say what and why, as [D]'s (c));
  - a new `docs/systems/terrace.md`, and the terrace lines in `docs/systems/terminal.md` and `airport-scene.md`.
  Anything else is outside the brief. Search `src/game/` for each new top-level name before using it.
- Screenshots of the Roof, Up and Down stops at phone (390×844 and 320×568, portrait and landscape), tablet (768×1024) and desktop (1440×900). By day and at night, zoomed out and at 1.6×, in rain, and with a famous face up. Looked at before the PR opens, and the terrace card at 320 px clear of the camera band and the sheet's handle.

## Read first

- The project notes, then `node tools/graph.mjs terrace`, `node tools/graph.mjs nextAct`, `node tools/graph.mjs 66-floors.js` and `node tools/graph.mjs famousPax`, and only what they list.
- `docs/specs/terminal-place.md` in full; `docs/systems/terminal.md` ("Passengers by state", "Passes over passengers"), `docs/systems/airport-scene.md` (layers, roofs and floors), the famous faces and late runners notes in `docs/systems/`; `tools/checks/terrace.mjs` and `tools/checks/lib/place.mjs`.
- The two floors' look back and `docs/lessons/156-systems-refactors.md` (how `PLAY` guards and profiles were done).

## Speed budget

Release 35's baseline (`docs/ideas/release-audit.md`, "Speed"), with the terrace's 25% of drawing headroom and 0.02× of simulation from the spec. Re-measure `main` first: median of three runs on `main` and three on the branch, alternately, on the same machine, both in the PR.
- Simulation (`perf`): at most +0.02× on the late game (0.154× of 0.25×). Sixteen stands of Midfield has only 0.046× left (0.329× of 0.375×): at most +0.01× there. The terrace isn't on Midfield yet, so this should be near zero. The throttled phone at sixteen stands must not fall by more than 0.3 game minutes a second.
- Drawing (`scene`): at most +0.065× on Classic desktop (0.291× of 0.55×); terminal zoomed in, Classic, at most +0.03× (0.205× of 0.33×); zoomed-in Midfield phone at most +0.028× (0.197× of 0.312×).
- One run varies by about ±0.05× for drawing and ±0.02× for simulation. For hot-loop work, profile (CDP `Profiler`, self time per function) rather than trusting single `perf` ratios.

## Commit author

KyleLookingAround <KyleMck10@hotmail.com> (the session-start hook sets it; check `git config user.email`).

## Who merges and when

- The session, per the `steward` playbook: open the PR from `.github/pull_request_template.md` and read its description back, removing any "Generated by" footer or session link. Subscribe to its events (`subscribe_pr_activity`) and keep a `send_later` (about 20 minutes) as the fallback.
- Record [D] in the PR: (a) game-code bugs a pre-written check caught before it opened, (b) found after, (c) pre-written checks you had to fix.
- Once the look back (`docs/lessons/<pr>-terrace.md`) is in and Checks, Description and Balance are green, mark it ready and turn on auto-merge (squash). Then confirm the Pages publish.
- **Balance:** `PLAY` moves (the terrace choice draws `rnd()`). Run the bot on seeds 1–3 before opening, per the `balance` playbook. Pacing must stay within 15% of `tools/baseline.json`, and terrace income at most 2% at level 9. If either is out, don't auto-merge: say so in the PR and leave it for the owner.

## What's left for others

- Not the other terminal-place parts: windows and watchers, decor and local character, each layout's own floor plan, and the PR that brings them together. They follow, one at a time, from their own briefs.
- No release: the coordinator starts one after this merges.
- Leave `28-region-weather.js` and `54-weather.js` alone (refactor 8, later); read weather through `drawnFx()` and `R.fx` as they are.
- At most three default-model sessions run at once. Don't start any session yourself: the coordinator does.

## When to stop and ask

- Only for something irreversible or outside this brief.
- Otherwise, if it truly needs the owner: open an issue labelled `needs-owner` with the question and the option it will take by default, carry on with other work, look at the issue at each stopping point, and take the default after 12 hours with no answer. Say so in the PR.
- Where it's merely unclear, take the safer option (easier to undo, or changing the game less) and say so in the PR.

## Cost budget

- Estimate: about $25 (a new room and floor link, three hooks, twelve checks switched on, a card, an upgrade, the bot on three seeds, screenshots at four sizes; two floors in Classic cost $30.13).
- At each stopping point (the PR opened, CI back, a merge), read `get_session`: `usage.cost_usd` against the estimate (a 0 means not yet known, not free), and `rate_limit_info`. If status is "rejected" or `isUsingOverage` is true, schedule a `send_later` for a minute after `resetsAt` and end the turn. Ignore `allowed_warning` (the owner's call, 29 Sep).
- Past twice the estimate: say why in the PR and in its look back, and trim or split what's left.
