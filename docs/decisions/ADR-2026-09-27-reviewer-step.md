---
type: Decision
description: A fresh reviewer that hasn't seen the work reads each diff before its PR opens.
status: stable
tags: [experiment]
---
# ADR-2026-09-27: A fresh review before each PR opens

## Status

Accepted as an experiment (runbook experiment [E]). Measured on the next five PRs; removed if it doesn't clearly earn its cost.

## Context

A session builds and reviews its own diff, so it re-reads what it already believes is correct. #39 missed updating the README for a change its own review should have caught, and only a later look found it. A reviewer that hasn't seen the work, reading only the diff and the project notes, is more likely to notice what the builder no longer sees: a broken rule, a stale doc line outside the diff, or wording the project notes forbid.

## Options Considered

### Option 1: One fresh helper review before opening the PR
**Description:** Between "Prove it" and "Ship" in the `feature` playbook, the session starts one fresh reviewer, a helper agent or the `code-review` skill at medium effort, and gives it the diff against `main`, the brief and the project notes. It asks for bugs, broken rules, lines outside the diff the change makes wrong, and anything in the PR's title or description the project notes don't allow. The session fixes what it agrees with and says in the PR what the review found.

**Pros:**
- Cheap: one medium-effort review per PR, no game code touched.
- Catches the class of miss #39 showed: a rule or a doc line outside the diff the builder stops seeing.
- Self-contained: a playbook step and a PR template line, nothing else to keep running.

**Cons:**
- Adds a review round and its cost to every PR, whether or not it finds anything.
- A helper reviewing only the diff can miss context a full read of the surrounding file would catch.

### Option 2: Keep review to CI and the owner
**Description:** Rely on `npm run check`, the Balance workflow and the owner's own review, as before.

**Pros:**
- Nothing new to run or keep.

**Cons:**
- CI checks rules it already has a check for; it can't catch a rule with no check yet, or a doc line the change makes wrong. That's what missed the README in #39.

### Option 3: A second full session reviews every PR
**Description:** Spin up a whole session, not a lighter helper, to review each PR before it opens.

**Pros:**
- Closer to a second pair of eyes with full tool access.

**Cons:**
- Far more expensive than a medium-effort helper for the same class of finding; building stays the expensive part, review shouldn't cost as much as it.

## Decision

Option 1. The `feature` playbook's new step 6, "A fresh review before opening", runs a medium-effort helper (`Agent` or the `code-review` skill) against the diff before every PR opens. The PR template's "Checks" list gets one line: "A fresh review before opening: what it found and what changed" — worded without naming the tool or saying "AI" or "assistant", as the project notes require for anything in a PR's title or description.

## Consequences

- Every PR from here reports what the fresh review found and what was fixed or left, in the PR body.
- Findings per PR that CI or a later review would otherwise have caught, and the review's cost, are tracked across the next five PRs (starting with this one) to decide whether it stays.
- If the measurement doesn't show a clear benefit for its cost, the playbook step and the template line come out together.
