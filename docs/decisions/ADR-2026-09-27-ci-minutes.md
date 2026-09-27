# ADR-2026-09-27: Spend CI minutes only where they confirm something

## Status

Accepted. Revisit if the repo goes public, where standard runners cost nothing.

## Context

The repo is private, so GitHub Actions minutes count against the plan's 3,000 a month. By 27 Sep, a day and a half after the repo was created, about 2,900 had gone. Balance used about 59% (six bot jobs of about four minutes, rerun on every push that touched the game) and Checks about 27% (128 runs, 44 of them reruns on the same branch). The hourly Parts together schedule would add about 720 a month on its own, since each run bills at least a minute. Sessions already run `npm run check` and the bot in their own containers, where minutes are free.

## Options Considered

### Option 1: Make the repo public
**Description:** Standard runners are free and unlimited on public repos.

**Pros:**
- Nothing else changes.

**Cons:**
- The code, issues, briefs and lessons become public. The owner's call, left for later.

### Option 2: Run locally first; CI confirms once
**Description:** Balance runs only on PRs labelled `balance` (keeping Classic) or `balance:rebuild` (both ways), and on demand. Checks skip drafts. Both cancel a run when a newer push arrives. Parts together drops its hourly schedule and skips PRs without a `part:` label before starting a runner. Sessions run the checks and seeds locally and report them in the PR.

**Pros:**
- Removes most of the spend: Balance runs once per PR that needs judging, at half the jobs by default.
- Keeps every check; only when it runs changes.

**Cons:**
- PLAY-identical claims rest on the session's local runs unless someone adds the label.
- One more step for sessions to remember (the label).

## Decision

Option 2, until the owner decides on Option 1.

## Consequences

- Sessions run `npm run check` and seeds 1–3 locally before pushing, and put the bot's `LVLAT` and `PLAY` lines in the PR.
- The `balance` label goes on once, when the code is final, for a change the owner will judge.
- Parts are tested together on pushes to them and on demand, not hourly.
