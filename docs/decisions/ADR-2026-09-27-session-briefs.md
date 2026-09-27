# ADR-2026-09-27: Sessions start from a checked brief, ask the owner through issues, keep to a cost budget, and parts are tested together

## Status

Accepted as four experiments (#35, runbook experiment [A]). Each is measured on "Looks like a real airport" and removed on its own if it doesn't clearly help.

## Context

The terminal was built in five parts side by side, each started with a hand-written brief. Its finishing session stopped to ask two questions its brief had answered, and the questions waited about six hours overnight. The parts were each under the speed budget alone and over it together, which showed only when they were brought together. One conversation that built four PRs cost $16.60 and used 417k of context, and nobody compared that with an estimate while it ran.

## Options Considered

### Option 1: A template, a checker, an issue queue, a budget read from the session, and a workflow over labelled PRs
**Description:** Briefs follow `docs/briefs/TEMPLATE.md` and `tools/brief.mjs` checks them; questions go to `needs-owner` issues with a default; the session's own `usage.cost_usd` is compared with the brief's estimate; `.github/workflows/parts.yml` checks every open `part:<feature>` PR with `main`.

**Pros:**
- Each piece is small, plain Node or a GitHub workflow, and can be removed alone.
- Nothing waits on the owner: a default is always named, and taken after 12 hours.
- Combination problems show on every push to a part, while they're cheap.

**Cons:**
- More ceremony per session: a brief to write and check.
- The parts workflow spends CI minutes on every push to a part, and hourly while something has moved.

### Option 2: Keep it in the playbooks' prose
**Description:** Write the same advice into the `feature` playbook and trust sessions to follow it.

**Pros:**
- Nothing new to keep.

**Cons:**
- That's what happened before: the brief answered the questions, and the session still stopped.

### Option 3: A merge queue or a long-lived integration branch
**Description:** Merge parts into a shared branch as they're built, or use GitHub's merge queue.

**Pros:**
- Tests the real merge order.

**Cons:**
- A shared branch needs someone to keep it; the merge queue tests only at merge time, which is too late to be cheap.

## Decision

Option 1:
- Every session or part is started from a brief made from `docs/briefs/TEMPLATE.md`, saved in `docs/briefs/`, and passing `node tools/brief.mjs`. The `brief` check group keeps them all complete.
- A question only the owner can answer goes in an issue labelled `needs-owner`, with the default the session will take after 12 hours; the session carries on meanwhile.
- At each stopping point a session compares `usage.cost_usd` from `get_session` with its brief's estimate (a 0 is not yet known). Past twice the estimate, it says why in the PR and `docs/LESSONS.md`, and trims or splits the rest.
- Parts of a split feature carry the label `part:<feature>`. The Parts workflow merges `main` and every open part in PR order into a temporary branch on the runner, runs `npm run check`, and keeps one comment on each part's PR, saying which part conflicts and how long it has been red.

## Consequences

- The `feature` and `steward` playbooks say when to write and check a brief, how to use the queue and the budget, and to read the Parts comment before merging a part.
- The look back in `docs/LESSONS.md` records cost against the estimate, hours waiting on the owner, and when the Parts workflow first went red.
- The Balance tables with every part in are not in the Parts workflow yet; they can follow if combination problems in pacing turn up.
- If an experiment doesn't clearly help on "Looks like a real airport", its piece comes out: the template section, the check, the workflow or the playbook lines.
