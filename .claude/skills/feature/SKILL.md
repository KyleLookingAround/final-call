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
- After the merge, look back at the session that built it (the `steward` playbook's last step) and log it in `docs/LESSONS.md`.

## Splitting a big feature across sessions

Worth it only when the feature has parts that can live in different files. The terminal (issue #17) was built this way; these are its lessons.

1. **Groundwork first, merged.** One PR lays the shared structure the parts plug into: tables and hooks, a file per part, a check group per part. It leaves `STATE` identical on seeds 1–3. Merge it, then start every part from `main`. Parts started from the unmerged branch look conflicted everywhere once it's squash-merged (the `steward` playbook has the fix).
2. **Two or three at a time.** Every session draws on the same five-hour usage limit. Five parts plus the coordinator used it up within the hour, and the rest ran as overage. Start a batch just after the limit resets.
3. **Each part's brief says:**
   - its files, the shared hooks it may add, and that its notes stay in its own bullet;
   - the functions and files to read first, so it doesn't explore the whole game;
   - its share of any shared budget. Measure the `perf` headroom on `main` and divide it between the parts, or they each spend all of it;
   - for balance, report the Balance workflow's tables and tune only outside 15% of the baselines. The rebalance happens once, with every part in;
   - to push and read the Balance workflow rather than run the seeds locally, unless it's tuning;
   - to open its PR, subscribe to the PR's events and end its turn, rather than wait for CI or the merge. The coordinator reviews and merges one part at a time, and each part's session wakes only if its PR needs it.
4. **Keep the coordinator light.** A long conversation re-reads its whole history on every turn, so it costs far more than a short one. Plan in the spec's "Order of work", start the coordinator fresh for each feature, and let PR notifications and one scheduled check-in wake it instead of polling. While the parts build, write the next spec.
5. **Bring it together** in one last PR: what spans the parts (each layout's version, the rebalance, screenshots, What's new, save fixtures, notes).
