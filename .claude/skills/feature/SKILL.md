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
- Get the owner's approval of the spec before writing code, and mark it `Approved` when they agree. A brief that approves a spec in advance counts: mark it `Approved`, say so in the spec, and build.

## 3. Build

- Find the code with `node tools/graph.mjs <name>` (a system, file, function, hook, saved field or check group): it lists the files, functions, hooks, checks, fields, decisions and lessons that relate. Then read only those.
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
- **Pending checks** (`tools/checks/pending.txt`): when your code makes a pending check pass, the run fails with `pending, but passes`. Take its line out in the same PR, which switches it on. Change a pre-written check only to fix a mistake in it, and say what and why in the PR; loosening a pass mark needs the coordinator. `TP_ALL=1` plays the checks that otherwise wait for their code.

## 5. Keep the docs true

- A new system gets a section in `docs/SYSTEMS.md` whose heading names its files, and the spec's first line lists its PRs; `npm run check -- graph` fails on a broken link or a section without files, and warns when a system's file changed but its section didn't.

- Project notes: anything about how the code works that changed.
- `docs/ROADMAP.md`: move the item along.
- `docs/decisions/`: add a record if the change sets a rule other changes must follow.

## 6. A fresh review before opening

- Before opening the PR, start one fresh reviewer that hasn't seen the work: a helper agent (`Agent`) or the `code-review` skill, at medium effort. Give it the diff against `main`, the brief and the project notes, and ask for bugs; broken rules (the owner's preferences, saved fields, `rnd()`, `R.sim`, UK English); lines outside the diff the change makes wrong (the README, code comments, the project notes, `docs/SYSTEMS.md`); and anything in the PR's title or description that the project notes don't allow.
- Fix what you agree with. Say in the PR what the review found and what was fixed or left, without naming the tool or saying "AI" or "assistant".
- Helpers are for reviewing and reading, never for building: building stays in separate sessions with their own PRs.

## 7. Ship

- Commit with a short imperative subject in plain words; add a body when the reason isn't obvious. No attribution lines; the project notes list what messages must leave out.
- `git push -u origin feature/<short-name>`, then open a PR with a plain title, filling in `.github/pull_request_template.md`. Open it as a draft while iterating, so Checks only runs the groups the change touches, and mark it ready for review before merging. Check the description afterwards and remove anything added that the template doesn't have.
- Follow the `steward` playbook until the PR is green, then merge it yourself with Squash and merge; `main` publishes to GitHub Pages.

## 8. Learn

- If a bug got through to players, add the check that would have caught it, in the same PR as the fix.
- After the merge, look back at the session that built it (the `steward` playbook's last step) and log it in `docs/LESSONS.md`.

## Working while the owner is away

Much of the work runs overnight. A question nobody answers costs hours, so:

- Don't stop on a question the brief or the project notes already answer. Read them again first.
- If something is truly ambiguous, take the safer option (the one easier to undo, or that changes the game less), say so in the PR, and carry on.
- Stop and ask only for something irreversible or outside the brief.
- **The needs-owner queue.** When the owner truly has to decide, don't wait in the conversation. Open an issue labelled `needs-owner` with the question, the options, and the one you'll take by default. Carry on with other work, look at the issue at each stopping point, and take the default after 12 hours with no answer; say so on the issue and in the PR, and close the issue.
- Where anything in the repo conflicts with the brief, the brief wins for that session; fix the conflict in the repo in the same PR.
- At each stopping point (a PR opened or merged, a spec written), check the session's usage (`get_session`). If `rate_limit_info` says "rejected" or `isUsingOverage`, schedule a `send_later` for a minute after `resetsAt` and end the turn instead of running on overage.
- **The cost budget.** Compare `usage.cost_usd` with the brief's estimate at each stopping point. It can read 0 early in a session and fill in later: a 0 means not yet known, not free. Past twice the estimate, say why in the PR and in `docs/LESSONS.md`, and trim or split what's left.
- **One PR-sized item per session.** When an item merges, the session that merged it writes the next item's brief from `docs/briefs/TEMPLATE.md`, saves it as `docs/briefs/<short-name>.md`, runs `node tools/brief.mjs` on it, and starts a fresh session for it (`create_session`) with the brief as its first message, rather than carrying on with its own history. The brief is committed in the new session's PR, and the `brief` check keeps it complete. Keep two items in one session only when they share code and the second can be built while the first's CI runs (Sound and the level-up card did).
- In a long-lived checkout, run `git status` before committing and stage paths by name: switching branches carries untracked and newly ignored files across.

## Splitting a big feature across sessions

Worth it only when the feature has parts that can live in different files. The terminal (issue #17) was built this way; these are its lessons.

1. **Groundwork first, merged.** One PR lays the shared structure the parts plug into: tables and hooks, a file per part, a check group per part. It leaves `PLAY` identical on seeds 1–3. Merge it, then start every part from `main`. Parts started from the unmerged branch look conflicted everywhere once it's squash-merged (the `steward` playbook has the fix).
2. **How many at once.** Go by `rate_limit_info.status`, as the `coordinator` playbook says: `allowed` runs what the plan's order of work allows, `allowed_warning` adds nothing beyond what's already running, and `rejected` or `isUsingOverage` waits for `resetsAt`. The practical limits are CI throughput and parts that touch the same files. On the old default-model plan, every session drew on the same five-hour usage limit, and five parts plus the coordinator used it up within the hour, with the rest running as overage.
3. **Each part's brief** is written from `docs/briefs/TEMPLATE.md` and says:
   - its label, `part:<feature>`, which the Parts workflow (`.github/workflows/parts.yml`) uses to merge it with `main` and the other open parts and run `npm run check`, keeping one comment on each part's PR. Read that comment before merging a part: it shows combination problems (conflicts, the parts' checks failing together) while they're still cheap;
   - its files, the shared hooks it may add, and that its notes stay in its own bullet;
   - the functions and files to read first, so it doesn't explore the whole game;
   - its share of any shared budget. Measure the `perf` headroom on `main` and divide it between the parts, or they each spend all of it;
   - for balance, report the Balance workflow's tables and tune only outside 15% of the baselines. The rebalance happens once, with every part in;
   - to push and read the Balance workflow rather than run the seeds locally, unless it's tuning;
   - to open its PR, subscribe to the PR's events and end its turn, rather than wait for CI or the merge, and not to book its own check-ins. The coordinator reviews and merges one part at a time and keeps the only check-in; each part's session wakes only if its PR needs it.
4. **Keep the coordinator light.** A long conversation re-reads its whole history on every turn, so it costs far more than a short one. Plan in the spec's "Order of work", start the coordinator fresh for each feature, and let PR notifications and one scheduled check-in wake it instead of polling. While the parts build, write the next spec. The `coordinator` playbook has the sweep, starting and retiring sessions, and how many run at once.
5. **Bring it together** in one last PR: what spans the parts (each layout's version, the rebalance, screenshots, What's new, save fixtures, notes).
