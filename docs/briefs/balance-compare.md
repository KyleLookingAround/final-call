---
type: Brief
---
# Brief: Balance workflow compares with the merge base, and a bot `--why` summary (#167)

## Goal and what it may touch

- Deliver #167 with the default the coordinator took on the issue (29 Sep):
  1. `.github/workflows/balance.yml` also builds the PR's **merge base** (not the moved `main`), runs the bot on seeds 1–3 there, and prints in its summary whether `PLAY` and `STATE` match the branch's, seed by seed. It does this only when the PR carries a `refactor` or `balance` label, so ordinary PRs don't pay for the extra runs.
  2. A `--why` option in `tools/run-bot.mjs` prints, per snapshot, which requirement holds each level back, read from the `why` field the bot's snapshots already hold (`tools/bot.js`).
- Also commit the coordinator's brief, given below this brief, as `docs/briefs/coordinator-2026-09-29b.md`, exactly as given.
- Branch `feature/balance-compare` from `main`, one PR that closes #167.
- Files it may touch: `.github/workflows/balance.yml`, `tools/run-bot.mjs`, the `balance` playbook (`.claude/skills/balance/SKILL.md`: replace the hand-made worktree steps with the label, keeping them as the fallback for local tuning), `docs/SYSTEMS.md`'s lines on the Balance workflow and the bot, the two brief files, and this PR's own lesson in `docs/lessons/`. Nothing in `src/`.

## Read first

- The project notes, then `node tools/graph.mjs brief`, and only the files that lists.
- Issue #167 and its comments, `.claude/skills/balance/SKILL.md`, `.claude/skills/steward/SKILL.md`, `.github/workflows/balance.yml`, `tools/run-bot.mjs`.

## Speed budget

None: no game code.

## Commit author

KyleLookingAround <KyleMck10@hotmail.com> (the session-start hook sets it; check `git config user.email`).

## Who merges and when

The session, with Squash and merge once checks are green. Subscribe to the PR's events (`subscribe_pr_activity`) once it's open, and keep a `send_later` (about 20 minutes) as the fallback. To prove the workflow, add the `balance` label to this PR: the comparison must run and report "match" on every seed, since the PR changes no game code. Say so in the PR with the table. The Pages publish skips tools-only pushes, so there is nothing to confirm there.

## What's left for others

- It is launch week: no game change of any kind. Don't start other sessions or touch the roadmap.
- After this, the coordinator runs launch triage, then the roof terrace (#133), the Roadmap tab (#137) and refactors 8 and 10.

## When to stop and ask

- Only for something irreversible or outside this brief.
- Otherwise, if it truly needs the owner: open an issue labelled `needs-owner` with the question and the option it will take by default, carry on with other work, look at the issue at each stopping point, and take the default after 12 hours with no answer. Say so in the PR.
- Where it's merely unclear, take the safer option (easier to undo, or changing the game less) and say so in the PR.

## Cost budget

- Estimate: about $6 (one workflow and one tool change, two or three CI rounds including the labelled Balance run).
- At each stopping point (a PR opened, CI back, a merge), read `get_session`: `usage.cost_usd` against the estimate (a 0 means not yet known, not free), and `rate_limit_info`. If status is "rejected" or `isUsingOverage` is true, schedule a `send_later` for a minute after `resetsAt` and end the turn. Ignore `allowed_warning` (the owner's call, 29 Sep).
- Starting another session (`create_session`)? Don't: only the coordinator starts sessions.
- Past twice the estimate: say why in the PR and in its lesson (`docs/lessons/`), and trim or split what's left.
