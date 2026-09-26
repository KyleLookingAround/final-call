---
name: feature
description: Build a feature or change for Final Call from issue to merged PR - spec, code, checks, screenshots, bot, docs. Use when asked to add, change or fix something in the game.
---

# Building a change

Work through these steps in order. Small fixes (a label, a nit, an obvious bug) can skip the spec; anything a player would notice as new gets one.

## 1. Start from an issue

- Find the issue for the work, or write one from `.github/ISSUE_TEMPLATE/` (Feature, Bug or Balance).
- Branch from the latest `main`: `git fetch origin main && git checkout -b feature/<short-name> origin/main`.

## 2. Spec first

- Copy `docs/specs/TEMPLATE.md` to `docs/specs/<short-name>.md` and fill it in. Keep it to a page.
- Check it against the owner's preferences in the project notes: no scenario choice, locked things hidden, impacts on the map/board/gates, concise UK English, phones down to 320 px, managers for players who'd rather not.
- Stop and get the owner's approval of the spec before writing code. Mark it `Approved` when they agree.

## 3. Build

- Find the code with the file table in the project notes, then search `src/game/` by name.
- A new system gets its own numbered file before `99-start.js`.
- New saved state: a default in `DEFAULT()`, handling for its absence in `resetAll`. Never rename or remove saved fields.
- Randomness that can change the game uses `rnd()`. `Math.random()` only on cosmetic lines ending with `// cosmetic`.
- Everything reachable from `update()` must work with `R.sim=true` (no DOM, no saving).
- Tests reach functions through `window.__sim` (list in `tools/build.mjs`).

## 4. Prove it

- `npm run build`, then `npm run check -- <group>` while iterating and the full `npm run check` before pushing.
- Add `rules` checks in `tools/check.mjs` for the new rules; update any rule you changed on purpose.
- `npm run check -- shots`, then read `build/shots/*.png` (phone, tablet, desktop). For other screens, write a Playwright script in `build/`.
- Economy or progression: follow the `balance` playbook.
- If a check fails, reproduce it (pages are seeded, so it repeats) and fix the cause. Never weaken or skip a check to get green.

## 5. Keep the docs true

- Project notes: anything about how the code works that changed.
- `docs/ROADMAP.md`: move the item along.
- `docs/decisions/`: add a record if the change sets a rule other changes must follow.

## 6. Ship

- Commit with a short imperative subject in plain words; add a body when the reason isn't obvious. No attribution lines; the project notes list what messages must leave out.
- `git push -u origin feature/<short-name>`, then open a PR with a plain title, filling in `.github/pull_request_template.md`. Check the description afterwards and remove anything added that the template doesn't have.
- Follow the `steward` playbook until the PR is green and merged. The owner merges with Squash and merge; `main` publishes to GitHub Pages.

## 7. Learn

- If a bug got through to players, add the check that would have caught it, in the same PR as the fix.
