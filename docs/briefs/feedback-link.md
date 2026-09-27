# Brief: A feedback link in Help

The coordinator's brief for "Feedback from players" under "Next" in `docs/ROADMAP.md`: a "Send feedback" link in Help that opens a prefilled GitHub issue. No tracking. A small change the owner allowed on 27 Sep 2026.

## Goal and what it may touch

- In Help, a "Send feedback" link opens a new GitHub issue in the game's repo in a new tab. The title is empty and the body is prefilled with what helps a bug report: the game's version, level, layout, game day, and the screen size and device type. The player sees everything before sending, and the game sends nothing itself.
- The repo comes from where the game is served: `<owner>.github.io/<repo>/` gives `github.com/<owner>/<repo>`. Anywhere else (a local file, `build/test.html`), the link is hidden. Hidden, not greyed, per the owner's preferences.
- Write a one-page spec, `docs/specs/feedback-link.md`, from `docs/specs/TEMPLATE.md`. Mark it `Approved`, saying the owner allowed small changes in the coordinator's session of 27 Sep 2026 and this brief describes it. If the spec needs anything this brief doesn't settle, take the smaller option.
- A check in `tools/check.mjs` (`rules`, or a new `tools/checks/feedback.mjs`): the link is hidden on `build/test.html`; with the location faked as `https://someone.github.io/final-call/`, it points at `github.com/someone/final-call/issues/new` with the body filled in; the body stays under GitHub's URL limit on a level 9 airport. Screenshots of Help at 320 px, phone (390×844), tablet and desktop, looked at before the PR opens.
- UK English, concise. No What's new entry or version bump: add a line to the roadmap's Done list for the next release's notes, as #39 did.
- Branch `feature/feedback-link` from `main`, one PR. `PLAY` must stay identical on seeds 1–3; the Balance workflow shows it.
- It may touch: `src/game/17-help-keys-speed.js`, the Help panel's CSS in `src/shell.html`, `tools/check.mjs` or a new `tools/checks/feedback.mjs`, the `window.__sim` list in `tools/build.mjs` if the check needs a function, its bullet in `docs/SYSTEMS.md`, `docs/ROADMAP.md`, `docs/LESSONS.md`, the spec, and this brief as `docs/briefs/feedback-link.md`. Nothing in the drawing files (`12-drawing.js`, `50-scene.js` and 51 to 55): the real airport's parts are working there.

## Read first

- The project notes (the owner's preferences), then `node tools/graph.mjs openHelp` and `node tools/graph.mjs 17-help-keys-speed.js`, and only the files they list.
- `node tools/graph.mjs 38-updates.js` for where the version lives. `docs/specs/TEMPLATE.md` for the spec.

## Speed budget

None measurable: one link, built when Help opens. Leave both `perf` simulation checks where `main` has them (within ±0.02×).

## Commit author

KyleLookingAround <KyleMck10@hotmail.com> (the session-start hook sets it; check `git config user.email`).

## Who merges and when

The session, with Squash and merge once checks are green, then confirms the Pages publish. Before merging, add its own look back to `docs/LESSONS.md` in the same PR, with the numbers known then, and no follow-up PR. If `docs/LESSONS.md`, `docs/ROADMAP.md` or `docs/SYSTEMS.md` conflicts with another merge, merge `main` in and keep both.

## What's left for others

- Running now or next, each in its own session: the three first-batch parts of "Looks like a real airport" (markings, planes, roofs), then weather and vehicles at the cheaper model, then the PR that brings them together; a coordinator playbook; the weekly health check; a look back at #39 with a check on PR descriptions.
- After the real airport merges, each in its own fresh session: faster CI (experiment [B]: cache Playwright's Chromium, and run only the check groups the graph says a change touches on draft PRs); "The terminal as a place" with its checks written before its code (experiment [D]); then the rest of `docs/ROADMAP.md`.
- Routine jobs go to the cheaper effort or model (experiment [C]). Pass this list on in any brief this session writes.

## When to stop and ask

- Only for something irreversible or outside this brief.
- Otherwise, if it truly needs the owner: open an issue labelled `needs-owner` with the question and the option it will take by default, carry on with other work, look at the issue at each stopping point, and take the default after 12 hours with no answer. Say so in the PR.
- Where it's merely unclear, take the safer option (easier to undo, or changing the game less) and say so in the PR.

## Cost budget

- Estimate: about $6 (a short spec, one link and its check, screenshots at four sizes; at the cheaper model).
- At each stopping point (a PR opened, CI back, a merge), read `get_session`: `usage.cost_usd` against the estimate (a 0 means not yet known, not free), and `rate_limit_info`. If status is "rejected" or `isUsingOverage` is true, schedule a `send_later` for a minute after `resetsAt` and end the turn.
- Past twice the estimate: say why in the PR and in `docs/LESSONS.md`, and trim or split what's left.
