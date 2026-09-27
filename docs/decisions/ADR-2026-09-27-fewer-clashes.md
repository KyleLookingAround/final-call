# ADR-2026-09-27: One file per entry, lists joined from them, and PRs kept up to date with main

## Status

Accepted as an experiment (runbook, `docs/briefs/fewer-clashes.md`). Measured by the merges from `main` each PR needs; kept only if it clearly helps.

## Context

Sessions slowed each other down through merge conflicts in shared bookkeeping, not the game. Of the last 100 commits on `main`, the project notes changed in 32, `docs/ROADMAP.md` and `docs/LESSONS.md` in 27 each, `docs/SYSTEMS.md` in 19, `tools/check.mjs` and `tools/build.mjs` in 13, `docs/HISTORY.md` in 12, `src/game/38-updates.js` in 11 and `docs/decisions/README.md` in 9. Most of those changes added a line to the same place in a list, so any two sessions running at once conflicted, and one PR took eight merges from `main`, with green CI each time. The owner wants any number of sessions to run at once, with no cap.

## Options Considered

### Option 1: One file per entry, lists joined by a script, and a workflow that merges main into open PRs
**Description:** Lessons, roadmap items, What's new entries, decision records, systems' notes and check groups each get their own file. `tools/join.mjs` rebuilds the lists that show them between `joined` markers, on every `npm run build`. The Catch up workflow merges `main` into each open PR when it moves, rebuilding the lists, and comments once when a real conflict stops it.

**Pros:**
- Two sessions adding entries touch different files, so they don't conflict; the joined lists can, but only inside their markers, where a rebuild clears it with no one deciding anything.
- Nobody picks a version number but a release, so two sessions can't claim the same one.
- Sessions stop chasing `main`: the workflow does it, and a session only merges by hand when a real conflict needs a decision.

**Cons:**
- More files, and a script and a workflow to keep.
- The workflow's pushes with the repo's token don't start `pull_request` workflows, so it starts Checks and Balance itself, and it can't push a merge that brings in a workflow change (it comments then) unless the owner adds a `CATCH_UP_TOKEN`.
- What's new and the history lag until a release folds the fragments in.

### Option 2: GitHub's merge queue
**Description:** Let GitHub test and merge PRs in order.

**Pros:**
- Tests the real merge order, with no workflow of our own.

**Cons:**
- It needs an organisation-owned repo, which this isn't; and it doesn't stop the conflicts, only orders them.

### Option 3: Fewer sessions at once
**Description:** Cap how many sessions run, so fewer PRs overlap.

**Pros:**
- Nothing to build.

**Cons:**
- The owner doesn't want a cap, and it slows everything to spare some bookkeeping.

## Decision

Option 1:
- **Entries are files.** A lesson is `docs/lessons/<pr>-<short-name>.md`; a roadmap item is `docs/roadmap.d/<date>-<name>.md` with a `Section:` first line; a What's new entry is `src/updates.d/<short-name>.md`, with no version; a system's notes are `docs/systems/<name>.md`; a check group is `tools/checks/<group>.mjs`, described by its opening comment. `docs/HISTORY.md` rows and `UPDATES` entries are written only by a release, from the fragments.
- **Lists are joined, never edited.** `tools/join.mjs` rebuilds the lists in `docs/LESSONS.md`, `docs/ROADMAP.md` (Now, Next, the runbook and Done), `docs/decisions/README.md` and `docs/SYSTEMS.md` (systems, checks and files) between `<!-- joined:… -->` markers, on every `npm run build`, and clears a merge conflict that lies only inside them.
- **Nothing is registered by hand.** `window.__sim` is built from the names the tools use; check groups are found by file.
- **The project notes are a short core**, with a table of where each topic's details live; a change edits its topic's file.
- **Versions are claimed by branch.** A release claims the next version by pushing `feature/release-<version>` before any work; a refused push means another session has it.
- **Catch up.** `.github/workflows/catch-up.yml` merges `main` into every open PR from this repo whenever `main` moves, never rebasing or force-pushing, and comments once (updated in place) on a real conflict.
- **The lessons tidy** runs when 8 lessons are new since the last one (`docs/lessons/.last-tidy`), fired by the session that added the 8th; its brief is `docs/briefs/lessons-tidy.md`.

## Consequences

- A session adds files and rebuilds; it never edits a joined list, `UPDATES` or `docs/HISTORY.md` for a feature.
- A session pulls before pushing, since the workflow may have merged `main` into its branch.
- Measure: merges from `main` per PR, by hand and by the workflow (target zero or one, however many sessions run), and for the tidy, lesson files before and after each run and how often it fires. If the joined lists still conflict often by hand, or the workflow's merges cost more CI than they save, reconsider.
