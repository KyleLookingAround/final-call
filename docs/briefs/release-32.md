# Brief: Release version 32

## Goal and what it may touch

- Cut release 32 with the `release` playbook, in one PR on `feature/release-32` from the latest `main`. Version 31 (the real airport, #67) already has its What's new entry and history row; version 32 records what players will notice that isn't in any entry yet:
  - the update toast: a toast when a new version is published, with Update now and Later (#64);
  - the quiet Ko-fi link in What's new, Settings and the level-up card (#54);
  - the feedback link in Help (#44);
  - check `git log` since version 30's entry for anything else players would notice that no entry mentions, and add it; leave out code-only and docs-only changes.
- It delivers:
  - a row for 32 at the top of `docs/HISTORY.md` and the same version in `UPDATES` in `src/game/38-updates.js` (short title, two to four points; the `rules` check fails if they disagree);
  - save fixtures, only if something added saved fields since the newest ones in `tools/saves/` (v29): look at `DEFAULT()` and `resetAll` in the diff since v29; if fields were added, run the bot on seed 1 and copy `build/saves/L1, L3, L5, L9.json` to `tools/saves/v32-L<n>.json`; if none, say so in the PR;
  - `docs/ROADMAP.md`: move shipped items to Done (the real airport, the update toast, Ko-fi, feedback link, health check, CI cache, reviewer step, systems review);
  - `docs/specs/systems-review.md`: change "Status: Proposed" to "Status: Approved", and its closing line to record that the owner approved it in full on 27 Sep 2026 (#65);
  - a look back in `docs/LESSONS.md`, and this brief as `docs/briefs/release-32.md`.
- Files it may touch: `docs/HISTORY.md`, `src/game/38-updates.js` (and the version constant it uses), `tools/saves/`, `docs/ROADMAP.md`, `docs/specs/systems-review.md`, `docs/LESSONS.md`, `docs/briefs/`. Anything else is outside the brief. No link preview: the game looks the same as version 31.

## Read first

- The project notes, the `release` and `steward` playbooks.
- `node tools/graph.mjs updates` and `node tools/graph.mjs resetAll`, and only the files they list.
- The descriptions of #44, #54 and #64 for what players see.

## Speed budget

None: no drawing or simulation code.

## Commit author

KyleLookingAround <KyleMck10@hotmail.com> (the session-start hook sets it; check `git config user.email`).

## Who merges and when

The session, with Squash and merge once Checks, Balance and Description are green on a head up to date with `main`, then confirms the Pages publish and the What's new card for 32 on the live site. Book your own `send_later` check-ins for your PR and delete them once merged. Nothing else is open, so `main` should stay still.

## What's left for others

- Not "The terminal as a place" or any refactor: those are fresh sessions after this.
- After this merges, each in its own fresh session: "The terminal as a place" (approved on #48): its checks-first PR, then its groundwork, then its parts, with refactor steps from the systems review (`docs/specs/systems-review.md`, approved in full on #65); the second half of faster CI (experiment [B]: run only the check groups the graph says a change touches, on draft PRs); then the systems review's design proposals in its recommended order, the idea board (`docs/ideas/board-2026-09.md`) and `docs/ROADMAP.md`. Idea round 4 was dropped by the owner (#62 closed).
- Routine jobs (look backs, save fixtures, doc moves, screenshot reviews) go to the cheaper model (experiment [C]). Pass this list on in any brief this session writes.

## When to stop and ask

- Only for something irreversible or outside this brief.
- Otherwise, if it truly needs the owner: open an issue labelled `needs-owner` with the question and the option it will take by default, carry on with other work, look at the issue at each stopping point, and take the default after 12 hours with no answer. Say so in the PR.
- Where it's merely unclear, take the safer option (easier to undo, or changing the game less) and say so in the PR.

## Cost budget

- Estimate: about $4 (docs and one What's new entry; a bot run only if saved fields changed; one CI round).
- At each stopping point (a PR opened, CI back, a merge), read `get_session`: `usage.cost_usd` against the estimate (a 0 means not yet known, not free), and `rate_limit_info`. If status is "rejected" or `isUsingOverage` is true, schedule a `send_later` for a minute after `resetsAt` and end the turn.
- Past twice the estimate: say why in the PR and in `docs/LESSONS.md`, and trim or split what's left.
