---
type: Brief
---
# Brief: Three bugs from the owner's phone: gate cards, the people mover, walls

The owner played on their phone on the morning of 28 Sep 2026 and saw three things wrong. They start sharing the game today, so these are launch fixes: small, safe, and looked at on a phone.

## Goal and what it may touch

- Fix issues #119 (the stand cards on the airport view overlap each other and hide what's under them), #120 (the Pier B people mover's car snaps and stutters between the piers) and #121 (passengers walk through a pier's wall instead of a doorway). Each issue says what the owner saw, where to look, and what a fix should do. One branch, `feature/phone-bugs` from `main`, one PR that closes all three ("Closes #119, #120, #121"; GitHub closes only the first, so close the other two by hand after the merge).
- **Wait for #113 first.** PR #113 (terminal-place groundwork, refactor 9) reshapes `src/game/12-drawing.js` into layers and is merging around 05:10–05:30 UTC. Read the code and reproduce all three bugs straight away (screenshots on `main` at a 390 px portrait phone, zoomed in on a pier with two boarding flights and an arrival deplaning; `tools/saves/v32-L9.json` or the newest save in `tools/saves/`), but don't edit a drawing file until #113 has merged: check with the GitHub tools, `send_later` ten minutes if it hasn't, and then branch from the `main` that carries it. If it still hasn't merged by 06:30 UTC, branch from `main` anyway and say so in the PR.
- **Drawing only where it can be.** #119 and #120 are drawing fixes: the game state and the random stream must not change, and `PLAY` and `STATE` must stay identical on seeds 1–3 (the Balance workflow shows it). #121 may be a routing fault; fix the cause, and if a true fix changes a walk time, keep it within `tools/baseline.json`'s tolerance and say exactly what moved.
- **Checks.** Each fix gets a check that fails on `main` before it: the cards check that no two stand cards overlap at phone, tablet and desktop widths on a seeded busy hour; the mover check that the car's drawn position never jumps more than a set distance between frames; the walls check that no drawn passenger step crosses a hall's wall except through a doorway. Put them in one new group, `tools/checks/phone-bugs.mjs`, or in the group that already covers that system (`docs/SYSTEMS.md` lists them); `docs/SYSTEMS.md` lists the new group with what it covers.
- **Look at it.** Before-and-after screenshots at 390 px portrait (and 320 px), a tablet and a desktop width in the PR, of the same spots the owner photographed. `npm run check -- shots` and the `topbar` and `layout` groups must still pass.
- It may touch: `src/game/12-drawing.js` (stand cards, `drawMover`, `paxEase`), `src/game/40-layout-drawing.js` (links), `route`/`walk` in `src/game/41-airside.js` and the room routing in `src/game/07-passengers.js` only if #121 needs it, `src/game/07-passengers.js` and `43`/`44` only for the walk that goes through the wall, `tools/checks/` (the new group), `docs/systems/` (the notes for drawing and passengers), `docs/SYSTEMS.md` (the check list), `src/updates.d/phone-bugs.md` (one What's new fragment, three short lines for players), `docs/lessons/<pr>-phone-bugs.md`, and this brief as `docs/briefs/phone-bugs.md`. Also commit the coordinator's brief, given at the end of this message, as `docs/briefs/coordinator-2026-09-28.md`, unchanged. Nothing else: not the top bar, not the panels, not the terminal-place groundwork's new files.
- **Timing.** The owner's cut-off: the PR must be open by 08:00 UTC and merged by 09:00 UTC. If a fix isn't safe by then, leave that issue open with a comment saying what you found, and merge the rest.

## Read first

- The project notes, then `node tools/graph.mjs drawMover`, `node tools/graph.mjs paxEase` and `node tools/graph.mjs route`, and only the files those list.
- Issues #119, #120 and #121; `docs/briefs/pax-movement.md` and `docs/lessons/89-pax-movement.md` (the last movement fix, and how it kept `PLAY` identical); the `feature` and `steward` playbooks; the drawing and passengers notes in `docs/systems/`.

## Speed budget

`perf` within noise of `main`: no new pass over passengers or stands each frame beyond what drawing already does; card placement is a handful of rectangle tests per frame.

## Commit author

KyleLookingAround <KyleMck10@hotmail.com> (the session-start hook sets it; check `git config user.email`).

## Who merges and when

The session, with Squash and merge once Checks, Balance and Description are green on a head up to date with `main`, then confirms the Pages publish, closes #120 and #121 by hand, and unsubscribes from the PR. Book your own `send_later` check-in whenever you end a turn waiting on CI. If the game code changes after the Balance run, add the `balance` label (remove it first if it's there).

## What's left for others

- Nothing else from the audit or the idea board: no new systems, no other polish. Refactor 7 and the terminal-place parts wait for the owner. After launch: one release a day at most, no new systems for 48 hours after a launch post.
- Release 34 (another session) folds every fragment on `main` at about 08:15 UTC; a fragment merged after that waits for the next release.

## When to stop and ask

- Only for something irreversible or outside this brief.
- Otherwise, if it truly needs the owner: open an issue labelled `needs-owner` with the question and the option it will take by default, take the default straight away, and say so in the PR. The owner asked not to be waited on.
- Where it's merely unclear, take the safer option (easier to undo, or changing the game less) and say so in the PR: a card that hides less beats a cleverer layout.

## Cost budget

- Estimate: about $8 (three small drawing fixes, three checks, screenshots at four widths, two CI rounds; the cheaper model).
- At each stopping point (a PR opened, CI back, a merge), read `get_session`: `usage.cost_usd` against the estimate (a 0 means not yet known, not free), `context_usage.used_tokens`, and `rate_limit_info`. If status is "rejected" or `isUsingOverage` is true, schedule a `send_later` for a minute after `resetsAt` and end the turn.
- Past twice the estimate: merge what's green, leave the rest as open issues with a comment, and say why in the PR and the lesson.

---

Save this brief as `docs/briefs/phone-bugs.md` in your PR. The coordinator's brief below goes in the same PR, unchanged, as `docs/briefs/coordinator-2026-09-28.md`.
