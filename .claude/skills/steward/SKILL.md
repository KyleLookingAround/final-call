---
name: steward
description: Drive a Final Call pull request to green and merged - reading CI failures, the Balance workflow, review comments, and stacked branches. Use when watching or fixing a PR in this repo.
---

# Getting a PR to green

## Checks workflow (`checks.yml`)

- It runs `npm run check` on every PR. Failure screenshots are in the `check-failures` artifact; `screenshots` is kept on every run.
- Every page is seeded, so a failure repeats locally: `npm run check -- <group>` (the groups are listed in the project notes).
- A line number from an error in the built page: `node tools/where.mjs <line>`.
- Fix the cause. Never skip, weaken or delete a check to get green, and never push an empty commit to re-run CI.

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
- The PR title and description are plain and follow the template.

## Done

Green checks, no conflicts, and every review thread answered. The owner merges with Squash and merge; confirm the Pages run afterwards.
