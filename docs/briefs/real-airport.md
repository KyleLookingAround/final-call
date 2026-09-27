# Brief: "Looks like a real airport": the spec, the groundwork and the parts' briefs

The coordinator's brief for bundle 2 in `docs/ROADMAP.md`. Start it as a fresh session with this file as its first message.

## Goal and what it may touch

- Write `docs/specs/real-airport.md` from `docs/specs/TEMPLATE.md`. The owner has approved it in advance: mark it `Approved` and say so in it. It covers:
  - apron markings, day and night lighting, roofs that cut away as you zoom in, better planes, weather you can see, and vehicles on the apron;
  - a richer top-down view, not isometric;
  - an "Order of work": the groundwork first (a lighting pass and drawing layers), merged on its own with `PLAY` unchanged on seeds 1–3; then two or three parts at a time, each with its share of the speed budget.
- Measure the `perf` headroom on `main` first (`npm run check -- perf`), and write each part's share into the spec.
- Build the groundwork on `feature/real-airport-groundwork` from `main`, one PR: the drawing layers and the lighting pass, with a check group for them. It may touch the drawing files (`12-drawing.js`, `13-camera.js`, `40-layout-drawing.js` and a new numbered file before `99-start.js`), `tools/check.mjs` or a new `tools/checks/` file, `docs/SYSTEMS.md`, the spec, the roadmap and this brief. No saved fields and no change to play: `PLAY` identical on seeds 1–3 against `main`.
- Write each part's brief in `docs/briefs/` from the template, with its label `part:real-airport` and its share of the speed budget, and check them with `node tools/brief.mjs`. Don't start the parts.
- The same PR (or a small one before it) carries the look back at #36 in `docs/LESSONS.md`: session `session_01D3rsa8d5gB5P9enJyeZ5Jj` (read its cost with `get_session`), the PR's open and merge times, and its CI runs.

## Read first

- The project notes, the `feature` playbook's "Splitting a big feature across sessions", `docs/decisions/ADR-2026-09-27-session-briefs.md`.
- `node tools/graph.mjs 12-drawing.js`, `node tools/graph.mjs 40-layout-drawing.js` and `node tools/graph.mjs perf`, then only the files they list. Note in the look back how much the graph saved (the knowledge-graph experiment is measured here).

## Speed budget

The groundwork gets at most a fifth of the `perf` headroom measured on `main`; the rest is divided between the parts in the spec.

## Commit author

KyleLookingAround <KyleMck10@hotmail.com> (the session-start hook sets it; check `git config user.email`).

## Who merges and when

The session, with Squash and merge once checks are green, then confirms the Pages publish. Parts later merge one at a time, each after the Parts workflow's comment shows them green together.

## What's left for others

- The parts themselves, two or three at a time, each in its own fresh session, with one or two at a cheaper effort or model (experiment [C]; `create_session` takes `model`). Routine jobs (look backs, save fixtures, doc moves, screenshot reviews) also go to the cheaper setting.
- Then, each in its own fresh session: faster CI once the real airport merges (experiment [B]: cache Playwright's Chromium, and run only the check groups the graph says a change touches on draft PRs); "The terminal as a place" with its checks written before its code (experiment [D]); then the rest of `docs/ROADMAP.md`.
- Pass this list on in each brief.

## When to stop and ask

- Only for something irreversible or outside this brief.
- Otherwise open an issue labelled `needs-owner` with the question and the default, carry on, look at it at each stopping point, and take the default after 12 hours. Where it's merely unclear, take the safer option and say so in the PR.

## Cost budget

- Estimate: about $20 (a spec, one groundwork PR with screenshots and a `PLAY` comparison, and the parts' briefs).
- At each stopping point, read `get_session`: `usage.cost_usd` against the estimate (a 0 is not yet known) and `rate_limit_info`. If status is "rejected" or `isUsingOverage` is true, schedule a `send_later` for a minute after `resetsAt` and end the turn. Past $40, say why in the PR and `docs/LESSONS.md`, and trim or split.
