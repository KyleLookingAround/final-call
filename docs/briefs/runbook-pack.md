---
type: Brief
---
# Brief: A runbook pack the owner can take to another workspace

The owner wants a zip of the runbook (the way this repo runs Claude sessions: the project notes, the playbooks, briefs, checks, workflows, decisions and lessons) and anything else useful, to copy into their Apprivo workplace Claude and learn from. Nothing about the game itself.

## Goal and what it may touch

- **Deliver the zip first, in this conversation.** Build `build/runbook-pack.zip` and send it with `SendUserFile` (status `proactive`, display `attach`) as soon as it's complete and checked, before the PR. The owner reads this session in the Claude app and downloads it there.
- **What's in the pack**, as a folder `runbook-pack/` with the repo's paths kept under it:
  - `README.md` at the top, written for someone who has never seen this repo: what the runbook is in one page (the loop from issue to spec to brief to build to prove to ship to learn; sessions that merge their own PRs; a coordinator that sweeps and starts sessions from briefs; check groups that fail on purpose; one file per lesson, roadmap item and decision; the cost and rate-limit rules; Routines for the watchdog and the lessons tidy); a map of every file in the pack and why it's there; and a section "Adapting this to another repo" that lists what's Final Call-specific in each playbook (the bot, baselines, saves, the canvas game) and what carries over as it is, with the five things to set up first (project notes, a brief template with a validator, a checks script, a commit-msg hook, a PR template).
  - `CLAUDE.md` (the project notes), `.claude/skills/*/SKILL.md` (all five playbooks), `.claude/settings.json`.
  - `docs/briefs/TEMPLATE.md` and `tools/brief.mjs`; the example briefs `coordinator-2026-09-27e.md`, `coordinator-2026-09-28.md` if on `main`, `watchdog.md`, `lessons-tidy.md`, `launch-triage.md` if on `main`, `runbook-briefs.md`, `phone-bugs.md` if on `main`, `release-32.md`; `docs/specs/TEMPLATE.md`.
  - `docs/decisions/` (all), `docs/LESSONS.md` and `docs/lessons/` (all), `docs/ROADMAP.md` (whole file, for "The runbook (experiments)"), `docs/PLAN.md` if it exists, and `docs/SYSTEMS.md` (for how the checks, build and the graph work).
  - `.github/workflows/` (all), `.github/pull_request_template.md`, `.github/ISSUE_TEMPLATE/`, `.githooks/commit-msg`.
  - `tools/join.mjs`, `tools/graph.mjs`, `tools/touched.mjs`, `tools/health.mjs`, `tools/check.mjs`, `tools/sources.mjs`, `tools/where.mjs`, `tools/checks/brief.mjs`, `tools/checks/rules.mjs` if it exists, and `package.json`. Not the game (`src/`), not the saves, not screenshots, not `node_modules` or `build/` beyond the zip itself.
  - `RUNBOOK-ALL.md`: every Markdown file above concatenated in reading order (README, project notes, playbooks, templates, decisions, roadmap, lessons), each under a heading with its path, so it can be uploaded to a Claude project as one document. Skip the code and workflow files here; they stay as files.
- **Then a small PR** on `feature/runbook-pack` from `main`: `tools/pack.mjs` that builds the same zip from the list above (so the owner can rebuild it any time with `npm run pack`), the `pack` script in `package.json`, one paragraph in `docs/SYSTEMS.md` under the tools, and this brief as `docs/briefs/runbook-pack.md`. `build/` is git-ignored, so the zip itself is never committed. No game code, so no Balance run.
- It may touch: `tools/pack.mjs` (new), `package.json` (the `pack` script only), `docs/SYSTEMS.md` (one paragraph under the tools), `docs/briefs/runbook-pack.md` (this brief), and `build/` (the zip, git-ignored). No hooks. Nothing else, and nothing in `src/`.
- Check the zip before sending: unzip it into a temp folder, confirm every listed file is there and `RUNBOOK-ALL.md` opens, and put the file count and size in your message to the owner.

## Read first

- The project notes, then `node tools/graph.mjs brief` and `node tools/graph.mjs join`, and only what those list.
- `docs/ROADMAP.md`'s "The runbook (experiments)" section and `docs/decisions/README.md`, for the README's one-page account.

## Speed budget

None: no game code.

## Commit author

KyleLookingAround <KyleMck10@hotmail.com> (the session-start hook sets it; check `git config user.email`).

## Who merges and when

The session, with Squash and merge once Checks and Description are green, then confirms the run finished (a docs-and-tools change doesn't publish Pages). The zip is sent to the owner in this conversation before the PR opens. Book your own `send_later` whenever you end a turn waiting on CI.

## What's left for others

- Nothing in the game. Don't rewrite the playbooks for another project; the README's "Adapting" section is the guide, and the owner does the adapting in their other workspace.
- The launch-day sessions (releases 33 and 34, the phone bugs) are running alongside; don't touch their PRs.

## When to stop and ask

- Only for something irreversible or outside this brief.
- Otherwise, if it truly needs the owner: open an issue labelled `needs-owner` with the question and the option it will take by default, take the default straight away, and say so in the PR.
- Where it's merely unclear, take the safer option: include a file rather than leave it out.

## Cost budget

- Estimate: about $5 (reading the runbook files, one README, one zip, one small PR, one CI round; the cheaper model).
- At each stopping point (the zip sent, the PR opened, CI back, the merge), read `get_session`: `usage.cost_usd` against the estimate, `context_usage.used_tokens`, and `rate_limit_info`. If status is "rejected" or `isUsingOverage` is true, schedule a `send_later` for a minute after `resetsAt` and end the turn.
- Past twice the estimate: send the zip as it is, say why in the PR, and stop.
