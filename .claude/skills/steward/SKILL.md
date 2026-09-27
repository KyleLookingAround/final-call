---
name: steward
description: Drive a Final Call pull request to green and merged - reading CI failures, the Balance workflow, review comments, and stacked branches. Use when watching or fixing a PR in this repo.
---

# Getting a PR to green

## Checks workflow (`checks.yml`)

- It runs `npm run check` on every non-draft PR (a draft only runs the groups its changes touch, below). Failure screenshots are in the `check-failures` artifact; `screenshots` is kept on every run.
- Every page is seeded, so a failure repeats locally: `npm run check -- <group>` (the groups are listed in the project notes).
- A line number from an error in the built page: `node tools/where.mjs <line>`.
- Fix the cause. Never skip, weaken or delete a check to get green, and never push an empty commit to re-run CI.
- Playwright's Chromium is cached, keyed on the pinned version in the project notes; a run that installs it from scratch (a cache miss, or the first run after a version bump) is not itself a failure.
- Open PRs as drafts while iterating, so Checks only runs the groups the change touches (`tools/touched.mjs`); mark the PR ready for review, which re-runs every group, before merging.

## Balance workflow (`balance.yml`)

- It runs the bot on seeds 1-3 when a PR touches `src/game/` or the bot. It fails only on errors; levels outside the baselines show as warnings.
- An `off` level needs a reason in the PR, or the owner's agreement and an updated `tools/baseline.json`. See the `balance` playbook.

## Review comments

- Small, clear asks (a rename, a nit, a missing check): fix, push, and reply briefly.
- Bigger asks or design questions: propose an approach to the owner before changing course.

## Stacked PRs

When one PR builds on another and the lower one is squash-merged, GitHub deletes the lower branch and points this PR at `main`. Move this branch's own commits onto `main`:

```
git fetch origin main
git checkout <this-branch>
git rebase --onto origin/main HEAD~<n>   # n = this PR's own commits, from its Commits tab
git push --force-with-lease
```

Check that the PR's diff now shows only its own changes, and change its base to `main` if it still points at the old branch. Only force-push branches you created; on anyone else's, merge `main` in instead.

## Parts of a split feature

When several branches were built side by side (the `feature` playbook's "Splitting a big feature across sessions"):

- The Parts workflow (`parts.yml`) merges `main` and every open PR labelled `part:<feature>` into a temporary branch and runs `npm run check`, on each push to a part, hourly and on demand (Actions › Parts together › Run workflow). Its comment on each part's PR says whether they're green together, which part conflicts and in which files, and how long it has been red. Fix a combination problem in the part that caused it, before merging any of them.
- Merge them one at a time, each once it's green. Before merging the next, bring it up to date with `main` and run `npm run check` again.
- If the parts started from a groundwork branch that was then squash-merged, GitHub shows conflicts across the whole groundwork, because it can't tell the squashed commit is the same work. Check that it is (`git diff <groundwork tip> <squashed commit>` prints nothing), then tell git so without rewriting the part's history:

  ```
  git merge -s ours <squashed commit>   # the groundwork is already here
  git merge origin/main                 # only what merged after it
  ```

  `git merge-tree --write-tree --merge-base=<groundwork tip> origin/main <part-branch>` shows beforehand which conflicts are real.
- A part's notes go in its own bullet; when two parts touch the same hook, keep both calls in the order the loops ran them before.
- Check the PR changes only its part's files and the hooks its brief allowed.

## Before every push

- `npm run build` and `npm run check` pass locally.
- The commit message is a plain imperative subject with no attribution lines; the commit hook enforces this.
- The PR title and description are plain and follow the template. The Description check (`.github/workflows/description.yml`) enforces this; the tools may add a footer when a PR opens, so read the description back once it's up.

## Done

Green checks, no conflicts, and every review thread answered. Then merge it yourself with Squash and merge: sessions have the owner's standing permission, and waiting costs hours when they're away. Confirm the Pages run afterwards. Only a PR that needs the owner's judgement waits for them: a balance change beyond the baselines' tolerance, or a spec question the brief doesn't settle. Say so in the PR, open a `needs-owner` issue with the default you'll take after 12 hours (the `feature` playbook), and carry on with other work.

## After merging: look back at the session

Every merged PR gets a short look back at the session that built it, so the next one costs less. Keep it to a few minutes.

1. **Numbers.** From the session's record (`get_session`): what it cost against its brief's estimate, how much of its context it used, and when it started. Any hours spent waiting on the owner (a `needs-owner` issue's open time, or a question in the conversation). From the PR: when it opened and merged, how many pushes came after it opened, and any red CI runs.
2. **Friction.** What slowed it or needed someone else. Look at what it got stuck on, what the PR says it left undone or saw fail once, and what the merge needed: conflicts, scope fixes, a rebalance.
3. **Record it** in `docs/LESSONS.md`: one entry per PR, a line per lesson.
4. **Act on it** when a lesson would have saved real time or credits, or it comes up a second time. Change the playbook, brief, check or tool that would have prevented it, in the same PR as the entry. Otherwise the entry is enough.
