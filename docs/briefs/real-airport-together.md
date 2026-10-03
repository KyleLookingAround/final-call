---
type: Brief
---
# Brief: Real airport: bring the five parts together

## Goal and what it may touch

- Bring "Looks like a real airport" (issue #37, `docs/specs/real-airport.md`, step 4 of "Order of work") to a finished release in one PR, on branch `feature/real-airport-together` from `main` after weather (#61) has merged. The five parts are merged: planes (#50), vehicles (#55), roofs (#52), markings (#53), weather (#61).
- It delivers:
  - screenshots of every layout by day and night (phone, tablet, desktop), looked at, with anything broken fixed or listed in the PR;
  - one What's new entry for all five parts and the version bump (`38-updates`), with `docs/HISTORY.md`; the owner asked why they saw no card, and this is the answer;
  - `npm run preview`, with the image and icon looked at and committed;
  - `docs/SYSTEMS.md` for the scene as a whole, and the project notes' file table rows for `51-markings` to `55-vehicles`;
  - the speed of all five together against the 0.55× `scene` budget in the spec (median of three `npm run check -- scene` runs on the branch against three on `main` before #50), in the PR; nothing merges over budget;
  - the five parts' look backs in `docs/LESSONS.md`, from their PRs and their sessions' records (`get_session` on `014M9Ym9XzR8Tm3LszDH3Drv` planes, `01CziGnfH8SiWVGbctTgd4Wu` vehicles, `01TWd3JDj7LDJoedcSLECf2y` roofs, `01HBP9vSppzPL43yK2ASWFJr` markings, `016YxvgQJZDHp8Skjdasztez` weather: cost, context, what went well, lessons), plus this PR's own;
  - fixing `__sim.AF_Y` (a getter copied at load, found by #50) if it is small; otherwise note it in `docs/ROADMAP.md`;
  - the coordinator's brief, given below this one, committed as `docs/briefs/coordinator-2026-09-27b.md`, and this brief as `docs/briefs/real-airport-together.md`.
- Files it may touch: `src/game/38-updates.js` and the version, `src/game/50-scene.js` to `55-*.js` and `12-drawing.js` only for fixes the screenshots or the budget need, `tools/build.mjs` (for `AF_Y`), `src/public/` preview files, `docs/` and the project notes. Anything else is outside the brief. No economy change: `PLAY` stays identical on seeds 1–3 (the Balance workflow shows it).
- No `part:` label: this is the finishing PR, not a part.

## Read first

- The project notes, the `feature` and `steward` playbooks, and `docs/specs/real-airport.md` (Speed budget, Order of work).
- `node tools/graph.mjs scene`, then the same for each of `51-markings` to `55-vehicles` and `updates`, and only the files they list.
- The five parts' PR descriptions (#50, #52, #53, #55, #61) for their measured shares and notes.

## Speed budget

All five together must stay under 0.55× in every `scene` check (Classic desktop, Midfield desktop, Midfield phone). If they don't, trim the costliest layer (each part's PR names its share) rather than raising the budget, and say so in the PR.

## Commit author

KyleLookingAround <KyleMck10@hotmail.com> (the session-start hook sets it; check `git config user.email`).

## Who merges and when

The session, with Squash and merge once checks (Checks, Balance, Description) are green on a head up to date with `main`, then confirms the Pages publish and the What's new card on the live site. Another session ("Tell players when a new version is ready") will also touch `docs/SYSTEMS.md` and the project notes after #61: on a conflict, merge `main` in and keep both sides.

## What's left for others

- Not the update toast (its own session), the systems review (its own session) or the idea board.
- After this merges, each in its own fresh session: "The terminal as a place" (approved on #48): its checks-first PR, then its groundwork, then its parts, with refactor steps from the systems review once the owner approves that plan; the second half of faster CI (experiment [B]: run only the check groups the graph says a change touches, on draft PRs); then whatever the owner approves from the systems review, the idea board (`docs/ideas/board-2026-09.md`) and `docs/ROADMAP.md`.
- A release (version history beyond this entry, save fixtures) is the owner's call; the coordinator asks them.
- Routine jobs (look backs, save fixtures, doc moves, screenshot reviews) go to the cheaper model (experiment [C]). Pass this list on in any brief this session writes.

## When to stop and ask

- Only for something irreversible or outside this brief.
- Otherwise, if it truly needs the owner: open an issue labelled `needs-owner` with the question and the option it will take by default, carry on with other work, look at the issue at each stopping point, and take the default after 12 hours with no answer. Say so in the PR.
- Where it's merely unclear, take the safer option (easier to undo, or changing the game less) and say so in the PR.

## Cost budget

- Estimate: about $10 (screenshots of every layout by day and night, three-plus-three `scene` runs, the preview, five look backs, and one or two CI rounds with merges of `main`).
- At each stopping point (a PR opened, CI back, a merge), read `get_session`: `usage.cost_usd` against the estimate (a 0 means not yet known, not free), and `rate_limit_info`. If status is "rejected" or `isUsingOverage` is true, schedule a `send_later` for a minute after `resetsAt` and end the turn.
- Past twice the estimate: say why in the PR and in `docs/LESSONS.md`, and trim or split what's left.
- Book your own check-ins for your own PR (`send_later`), and delete them once merged.
