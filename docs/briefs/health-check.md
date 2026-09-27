# Brief: Weekly health check

The coordinator's brief for "Weekly health check" under "Next" in `docs/ROADMAP.md`: a scheduled run of the checks and the bot on `main` that opens an issue when something drifts. No game code.

## Goal and what it may touch

- A workflow, `.github/workflows/health.yml`, that runs weekly (a minute that isn't :00, early Monday UTC) and on demand, on `main`:
  - `npm run check`;
  - the bot on seeds 1–3 for 1,150 game hours, keeping Classic, as `balance.yml` does.
- When anything fails, errors, or reaches a level outside `tools/baseline.json`, it opens one issue labelled `health`, or updates the open one. The issue gets a table like the Balance summary, the failing check groups and a link to the run. When a later run is clean, it comments and closes the issue. It never opens a second issue while one is open.
- Reuse what `balance.yml` and `checks.yml` already do: the same setup steps and the same bot command. Read the bot's table rather than parsing new output; a small script in `tools/` is fine if it needs one.
- Branch `feature/health-check` from `main`, one PR. Prove it with a `workflow_dispatch` run on the branch before merging, and link that run in the PR. To prove it opens an issue, use a manual run with an input that forces a drift (for example, a tightened baseline range passed in), then close the test issue. Don't change `tools/baseline.json`.
- It may touch: `.github/workflows/health.yml` (new), a helper in `tools/` if needed, the "Build and test" part of the project notes (one line naming the workflow), its bullet in `docs/SYSTEMS.md`, `docs/ROADMAP.md` (move it from Next to Done), `docs/LESSONS.md`, and this brief as `docs/briefs/health-check.md`. Nothing in `src/game/`, and no change to `checks.yml`, `balance.yml`, `parts.yml` or `pages.yml`.

## Read first

- The project notes (Build and test, the balance baselines), then `node tools/graph.mjs perf` and `node tools/graph.mjs graph`, and only the files they list.
- `.github/workflows/balance.yml`, `.github/workflows/checks.yml` and `.github/workflows/parts.yml`. The last shows how a workflow keeps one comment updated with `actions/github-script`.

## Speed budget

None: no game code.

## Commit author

KyleLookingAround <KyleMck10@hotmail.com> (the session-start hook sets it; check `git config user.email`). A commit touching the project notes calls them "project notes".

## Who merges and when

The session, with Squash and merge once checks are green, then confirms the Pages publish. Before merging, add its own look back to `docs/LESSONS.md` in the same PR, with the numbers known then, and no follow-up PR. If `docs/LESSONS.md`, `docs/ROADMAP.md` or the project notes conflict with another merge, merge `main` in and keep both.

## What's left for others

- Running now or next, each in its own session: the three first-batch parts of "Looks like a real airport" (markings, planes, roofs), then weather and vehicles at the cheaper model, then the PR that brings them together; a coordinator playbook; the feedback link; a look back at #39 with a check on PR descriptions.
- After the real airport merges, each in its own fresh session: faster CI (experiment [B]: cache Playwright's Chromium, and run only the check groups the graph says a change touches on draft PRs); "The terminal as a place" with its checks written before its code (experiment [D]); then the rest of `docs/ROADMAP.md`.
- Routine jobs go to the cheaper effort or model (experiment [C]). Pass this list on in any brief this session writes.

## When to stop and ask

- Only for something irreversible or outside this brief.
- Otherwise, if it truly needs the owner: open an issue labelled `needs-owner` with the question and the option it will take by default, carry on with other work, look at the issue at each stopping point, and take the default after 12 hours with no answer. Say so in the PR.
- Where it's merely unclear, take the safer option (easier to undo, or changing the game less) and say so in the PR.

## Cost budget

- Estimate: about $6 (one workflow built from the two there are, two or three manual runs to prove it; at the cheaper model).
- At each stopping point (a PR opened, CI back, a merge), read `get_session`: `usage.cost_usd` against the estimate (a 0 means not yet known, not free), and `rate_limit_info`. If status is "rejected" or `isUsingOverage` is true, schedule a `send_later` for a minute after `resetsAt` and end the turn.
- Past twice the estimate: say why in the PR and in `docs/LESSONS.md`, and trim or split what's left.
