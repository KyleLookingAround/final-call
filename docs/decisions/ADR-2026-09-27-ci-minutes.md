# ADR-2026-09-27: A public repo, and CI that cancels superseded runs

## Status

Accepted.

## Context

While the repo was private, GitHub Actions minutes counted against the plan's 3,000 a month, and about 2,900 went in a day and a half. Balance used about 59% (six bot jobs on every push that touched the game) and Checks about 27% (128 runs, 44 of them reruns on the same branch). Every run of Parts together started a runner, even for PRs that weren't parts.

## Options Considered

### Option 1: Keep it private and cut the runs
**Description:** Balance only on a label, Checks skip drafts, no hourly Parts run, sessions confirm locally.

**Pros:**
- Stays within the plan's minutes.

**Cons:**
- PLAY-identical claims would rest on local runs, and sessions have one more step to remember.

### Option 2: Make the repo public
**Description:** Standard runners are free on public repos, so the workflows keep running as before.

**Pros:**
- Every PR keeps its automatic Balance and Checks runs.

**Cons:**
- The code, issues, briefs and lessons are public.

## Decision

Option 2. The owner made the repo public on 27 Sep 2026. Two changes are kept because they cost nothing and shorten the queue: Checks and Balance cancel a run when a newer push to the same PR arrives, and Parts together skips PRs without a `part:` label before starting a runner.

## Consequences

- Runs are free, but runners are shared: the account runs a limited number of jobs at once, and a busy day of sessions still queues. Cancelling superseded runs keeps that queue short.
- If the repo goes private again, Option 1 is the plan, and the numbers above are the baseline.
