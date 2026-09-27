# Brief: Fewer clashes between sessions, and a regular tidy of the lessons

## Goal and what it may touch

- Let any number of sessions run at once without chasing `main`. Today the slowdown is merge conflicts in shared bookkeeping files, not the game code. One PR took eight merges with green CI every time. Branch `feature/fewer-clashes` from `main`, one PR. The owner does not want a cap on how many sessions run: don't add one, and remove any "fewer at once" wording this replaces.
- The most-changed files in the last 100 commits on `main` were the project notes (32), `docs/ROADMAP.md` (27), `docs/LESSONS.md` (27), `docs/SYSTEMS.md` (19), `tools/check.mjs` and `tools/build.mjs` (13 each), `docs/HISTORY.md` (12), `src/game/38-updates.js` (11) and `docs/decisions/README.md` (9). Most are lists that every session adds a line to in the same place.
- The changes:
  1. **Lessons as one file per PR.** `docs/lessons/<pr>-<short-name>.md`, one entry each, in today's shape (numbers, went well, lessons with →). Move the existing entries out of `docs/LESSONS.md` into files. `LESSONS.md` keeps its intro and becomes a generated index (a small script in `tools/`, run by `npm run build` or the `graph` check), or a pointer to the folder: take whichever needs no hand-editing.
  2. **Roadmap and history lines the same way** where a session only adds a line (e.g. `docs/roadmap.d/`, `docs/history.d/`), joined by the same script. Hand-edited sections the owner reorders stay as they are.
  3. **What's new as fragments.** A feature adds its entry as its own file; the `release` playbook assigns the version number and folds the fragments into `UPDATES` in `src/game/38-updates.js`. Two sessions must not both be able to claim the next version. `PLAY` and `STATE` stay identical on seeds 1–3.
  4. **Generated indexes, not hand-kept ones.** `docs/decisions/README.md` built from the folder. Anything still registered in a central list in `tools/build.mjs` (`__sim`) or `tools/check.mjs` (groups) moves to per-file registration, as `SIMX` and `tools/checks/` already do.
  5. **Split the project notes' details by topic** so a change to one system edits that system's notes, not the shared file. Keep a short core in the project notes; details go to the playbooks and `docs/SYSTEMS.md` sections (split into per-system files if that file is still a hotspot). The rule "keep the notes true in the same PR" stays, pointing at the per-topic file.
  6. **Automatic catch-up.** A workflow (`.github/workflows/catch-up.yml`) that, when `main` moves, merges `main` into each open PR from this repo and pushes if it merges cleanly, and comments once if it doesn't. It never rebases or force-pushes.
  7. **A regular tidy of the lessons.** A weekly Routine (`create_trigger`, a fresh session each time, Mondays early UK time) that reads every lesson file and opens one PR which:
     - merges lessons that say the same thing into one, keeping each source's PR number;
     - groups related lessons under a theme (merge-chasing, checks, cost, tools, saves…), with a theme field at the top of each file so the index can group them;
     - deletes lessons that are out of date (the tool, file or rule they describe is gone) or already written into a playbook, the project notes or a check, naming where in the PR;
     - turns a lesson seen three or more times without a → into a proposed playbook or check change in the same PR, or a `needs-owner` issue if it's a rule change the owner should decide;
     - changes nothing in the game, and squash-merges itself once checks are green.
     Write its brief as `docs/briefs/lessons-tidy.md` from the template and give the Routine that brief as its prompt. Record the Routine's id in the `coordinator` playbook.
- Files it may touch: `docs/LESSONS.md`, `docs/lessons/`, `docs/ROADMAP.md`, `docs/HISTORY.md` and any new `*.d/` folders, `docs/decisions/README.md`, `docs/SYSTEMS.md` (and a split of it), the project notes, `.claude/skills/` (`feature`, `steward`, `release`, `coordinator`), `tools/` (a new join script, `build.mjs`, `check.mjs`, `graph.mjs` so it follows the moved files), `src/game/38-updates.js` and the `UPDATES` fragments only, `.github/workflows/catch-up.yml`, a decision record, and this brief. No other game code.
- Each change gets a line under "The runbook" in `docs/ROADMAP.md` and its measurement in the lessons. It stays only if it clearly helps. Measure: extra merges from `main` per PR (the worst so far is eight; the target is zero or one however many sessions run), and for the tidy, the number of lesson files before and after each run.

## Read first

- The project notes, then `node tools/graph.mjs 38-updates.js` and `node tools/graph.mjs graph`, and only the files those list.
- The `feature`, `steward`, `release` and `coordinator` playbooks; the lessons that mention merge-chasing (#47, the Ko-fi link, "Tell players when a new version is ready"); `docs/decisions/ADR-2026-09-27-session-briefs.md`.
- Background: [changelog fragments (towncrier)](https://github.com/dbt-msft/dbt-sqlserver/issues/854) and [GitHub's merge queue](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue), which needs an organisation-owned repo, so it isn't part of this brief.

## Speed budget

None: the only game file touched is the What's new list, which runs once when its card opens.

## Commit author

KyleLookingAround <KyleMck10@hotmail.com> (the session-start hook sets it; check `git config user.email`).

## Who merges and when

The session, with Squash and merge once checks are green, then confirms the Pages publish. Because this PR moves the hotspot files themselves, merge `main` in immediately before merging, and ask the coordinator to hold other merges for those few minutes.

## What's left for others

- Don't start the weekly tidy's first run by hand. Let the Routine fire.
- Don't add a limit on sessions. The owner's order of work continues as in `docs/ROADMAP.md`.
- A merge queue is for later, if the owner moves the repo into an organisation.

## When to stop and ask

- Only for something irreversible or outside this brief.
- Otherwise, if it truly needs the owner: open an issue labelled `needs-owner` with the question and the option it will take by default, carry on with other work, look at the issue at each stopping point, and take the default after 12 hours with no answer. Say so in the PR.
- Where it's merely unclear, take the safer option (easier to undo, or changing the game less) and say so in the PR.

## Cost budget

- Estimate: about $20 (many files moved, tooling, one workflow and one Routine, and at least one merge from `main` since it touches the hotspots).
- At each stopping point (a PR opened, CI back, a merge), read `get_session`: `usage.cost_usd` against the estimate (a 0 means not yet known, not free), and `rate_limit_info`. If status is "rejected" or `isUsingOverage` is true, schedule a `send_later` for a minute after `resetsAt` and end the turn.
- Past twice the estimate: say why in the PR and in the lessons, and trim or split what's left.
