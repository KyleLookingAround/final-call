# Brief: Runbook experiment [A]: briefs, the needs-owner queue, cost budgets and testing parts together

The owner's brief for this session, in the template's shape. It changes how sessions work, not the game.

## Goal and what it may touch

- Branch `feature/runbook-briefs` from `main`, one PR, four experiments:
  1. A brief template, `docs/briefs/TEMPLATE.md`, with `node tools/brief.mjs <file>` failing on a missing section and a `brief` check group running it on every file in `docs/briefs/`. The `feature` playbook runs it before starting a session. This brief is saved here and must pass.
  2. A "needs the owner" queue: an issue labelled `needs-owner` with the question and the default; carry on, look at it at each stopping point, take the default after 12 hours. Measure: time spent idle waiting on answers (six hours overnight last time).
  3. A cost budget per brief: at each stopping point, `usage.cost_usd` from `get_session` against the estimate (a 0 is not yet known); past twice the estimate, say why in the PR and `docs/LESSONS.md`, and trim or split. For comparison: Sound, the level-up card, the graph and the redesign in one conversation cost $16.60 and used 417k of context.
  4. Testing parts together: `.github/workflows/parts.yml` merges `main` and every open PR labelled `part:<feature>` into a temporary branch and runs `npm run check`, on pushes to those PRs, hourly and on demand, keeping one updated comment on each part's PR. Balance tables can follow. Measure: how soon combination problems show, and the time from the last part's merge to green.
- It may touch: `docs/briefs/`, `tools/brief.mjs`, `.github/workflows/parts.yml`, a decision record, the `feature` and `steward` playbooks, `docs/ROADMAP.md`, `docs/LESSONS.md`, one line of the project notes, and a `brief` group in `tools/check.mjs`. No game code: nothing in `src/game/`.
- Each experiment gets a line under "The runbook" in `docs/ROADMAP.md`, a decision record where it sets a rule, and its measurement in `docs/LESSONS.md`. It stays only if it clearly helps; otherwise write down why and remove it.

## Read first

- The project notes; the `feature` and `steward` playbooks; the top four entries of `docs/LESSONS.md`; "The runbook (experiments)" in `docs/ROADMAP.md`.
- Anything else through `node tools/graph.mjs graph` (or another name), not by reading the docs end to end.

## Speed budget

None: no game code.

## Commit author

KyleLookingAround <KyleMck10@hotmail.com>.

## Who merges and when

The session, with Squash and merge once checks are green, then confirms the Pages publish. Its look back goes in `docs/LESSONS.md` in a follow-up PR, or in the first PR of the next session.

## What's left for others

- Next: "Looks like a real airport" (`docs/specs/real-airport.md`, pre-approved): apron markings, day and night lighting, roofs that cut away as you zoom in, better planes, weather you can see, vehicles on the apron; a richer top-down view, not isometric; an "Order of work" with the groundwork first (a lighting pass and drawing layers, merged on its own with `PLAY` unchanged), then two or three parts at a time, briefed with the template, each with its share of the speed budget measured from `perf` on `main`. Start it as a fresh session with a brief from the template and use the graph there so it gets measured. Don't start the parts.
- Then, each in its own fresh session: the real airport's groundwork and parts, one or two parts at a cheaper effort or model (experiment [C]; `create_session` takes `model`), with routine jobs (look backs, save fixtures, doc moves, screenshot reviews) at the cheaper setting too; faster CI once it merges (experiment [B]: cache Playwright's Chromium, and run only the check groups the graph says a change touches on draft PRs); "The terminal as a place" with its checks written before its code (experiment [D]); then the rest of `docs/ROADMAP.md`.
- Pass this list on in each brief.

## When to stop and ask

Only for something irreversible or outside this brief. Otherwise use the `needs-owner` queue this session builds, take the safer option, and say so in the PR.

## Cost budget

- Estimate: about $10–15, one small PR with tooling and docs.
- At each stopping point, read `get_session`'s `usage.cost_usd` and `rate_limit_info`. If status is "rejected" or `isUsingOverage` is true, schedule a `send_later` for a minute after `resetsAt` and end the turn.
