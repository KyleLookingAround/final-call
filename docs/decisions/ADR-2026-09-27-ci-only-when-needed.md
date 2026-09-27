# ADR-2026-09-27: Run each workflow only when its result can change

## Status

Accepted. Supersedes [ADR-2026-09-27-ci-minutes](ADR-2026-09-27-ci-minutes.md).

## Context

The repo is public, so standard runners cost nothing, but the owner doesn't want workflows running when they aren't needed. Before this, Balance ran six bot jobs on every push that touched the game, Checks ran on drafts, the Description check ran on every push though a push can't change a PR's text, Parts together ran hourly, and Pages rebuilt and redeployed the same page on every docs-only merge.

## Options Considered

### Option 1: Keep every trigger, cancel superseded runs
**Description:** What #91 did.

**Pros:**
- Every push gets a fresh result from every workflow.

**Cons:**
- Most of those runs repeat a result nothing could have changed.

### Option 2: Trigger each workflow on what can change its result
**Description:**
- Balance runs once, when a PR opens or leaves draft, and again when the `balance` label is added, not on every push.
- Checks skips drafts.
- Description runs when the PR is opened, edited or reopened, not on pushes.
- Parts together runs on pushes to parts and on demand, not hourly.
- Pages runs only when `src/`, the build scripts, `package.json` or its own workflow change.

**Pros:**
- Far fewer runs, and the ones left each answer a real question.

**Cons:**
- A Balance result can be older than the PR's last push. Sessions add the label to rerun it on the final code before merging.

## Decision

Option 2, keeping #91's cancelling of superseded runs and Parts' skip for PRs that aren't parts.

## Consequences

- The steward playbook says to add the `balance` label before merging if the game code changed after Balance last ran.
- Catch up (`catch-up.yml`) starts Checks after it merges `main` into a PR, but never Balance: a merge from `main` would otherwise run six bot jobs on every open game PR each time `main` moves.
- If a workflow ever becomes a required check in branch protection, a skipped trigger (a push for Description, a draft for Checks) can leave it missing on the head commit: set its triggers again then.
- **Amended by #79.** "Checks skips drafts" is replaced by `tools/touched.mjs`: a draft runs only the check groups its changed files touch (plus `brief`, `graph` and `sim`), rather than nothing, since the two PRs solved the same waste independently and in different ways. The job still runs on every draft push (with the concurrency group from #91 still cancelling a superseded one); marking a PR ready for review, or a PR that isn't a draft, runs every group as before.
