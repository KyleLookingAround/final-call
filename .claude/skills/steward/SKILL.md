---
name: steward
description: Drive a Final Call pull request to green and merged - reading CI failures, the Balance workflow, review comments, and stacked branches. Use when watching or fixing a PR in this repo.
---

# Getting a PR to green

## Checks workflow (`checks.yml`)

- It runs `npm run check` on every PR. Failure screenshots are in the `check-failures` artifact; `screenshots` is kept on every run.
- Every page is seeded, so a failure repeats locally: `npm run check -- <group>` (`sim`, `rules`, `saves`, `layout`, `sheet`, `tour`, `shots`).
- A line number from an error in the built page: `node tools/where.mjs <line>`.
- Fix the cause. Never skip, weaken or delete a check to get green, and never push an empty commit to re-run CI.

## Balance workflow (`balance.yml`)

- It runs the bot on seeds 1-3 when a PR touches `src/game/` or the bot. It fails only on errors; levels outside the baselines show as warnings.
- An `off` level needs a reason in the PR, or the owner's agreement and an updated `tools/baseline.json`. See the `balance` playbook.

## Review comments

- Small, clear asks (a rename, a nit, a missing check): fix, push, and reply briefly.
- Bigger asks or design questions: propose an approach to the owner before changing course.

## Stacked PRs

When one PR builds on another and the lower one is squash-merged:

```
git fetch origin main
git rebase --onto origin/main origin/<lower-branch> <this-branch>
git push --force-with-lease
```

Then change the PR's base to `main`. Only force-push branches you created; on anyone else's, merge `main` in instead.

## Before every push

- `npm run build` and `npm run check` pass locally.
- The commit message is a plain imperative subject with no attribution lines; the commit hook enforces this.
- The PR title and description are plain and follow the template.

## Done

Green checks, no conflicts, and every review thread answered. The owner merges with Squash and merge; confirm the Pages run afterwards.
