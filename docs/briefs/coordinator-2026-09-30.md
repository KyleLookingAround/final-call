# Brief: Coordinator, from decor through the floor plans and bringing the terminal together

A handover from `session_01GnLSn9mHsUYxPjZiqbmLpC`, the coordinator that ran from 17:46 on 29 Sep to about 00:00 on 30 Sep. It handed over at 425k of context and about $11. This is the state at 01:20 UTC on 30 Sep. Follow the `coordinator` playbook, with the changes below; where they differ, this brief wins.

## Goal and what it may touch

- **Where the game is:** release 36 ("the roof terrace and the Roadmap tab") is live at https://kylelookingaround.github.io/final-call/ (d64b2ee). Windows and watchers (#183) and decor (#184) merged after it; release 37 ships them.
- **The owner parked the public launch** (29 Sep, about 17:55). There is no launch triage, no 48-hour hold and no one-release-a-day limit. If the owner says they've shared the game, the `release` playbook's launch-week rules and `docs/briefs/launch-triage.md` apply again.
- **The plan, in order:**
  1. **Decor and local character** (#184) merged at about 01:00 on 30 Sep (fb005f5), $11.74. Its Pages publish was green, and its session is archived.
  2. **Release 37** (windows and decor) was started by the outgoing coordinator at about 01:20: `claude-sonnet-5-5`, `feature/release-37`, brief `docs/briefs/release-37.md`. It commits this brief too, and merges itself. After it merges, update the players' roadmap page (see below) and tell the owner in a few lines.
  3. **Each layout's own floor plan** (#133 step 5; step 6 in the spec's order of work):
     - all eight other layouts, with the terrace; a new numbered file after decor's;
     - the three `plans:` checks;
     - default model; its brief decides whether to split the pier layouts from the rest.
     Model the brief on `docs/briefs/terminal-place-windows.md` and `terminal-place-decor.md`, with the speed numbers from decor's PR (#184) and the lessons in `docs/lessons/181-terrace.md`, `183-windows.md` and decor's.
  4. **Bring it together** (#133 step 6), as the spec's order of work says, then a release.
  5. **Refactors 8 and 10,** in a quiet window with no feature sessions open.
  6. **O1 (#154):** planes leaving hours before the board's time. Recommend it to the owner as its own batch once the terminal work settles, and only build it if they say yes.
  7. Keep `docs/ROADMAP.md` current through each session's roadmap items.
- **The players' roadmap page:** https://claude.ai/artifact/6eT5NjK6QonjBduTh8x2XN, version 3, updated at release 36. Read it (`action: "read"`), then publish with `url`. Its list mirrors `src/roadmap.d/`; keep the two in step. It is private until the owner shares it.
- **Usage:** ignore `allowed_warning` (the owner's call). On `rejected`, book a `send_later` a minute after `resetsAt` and wake each stalled session then. Keep at most three default-model sessions at once, and put small, routine and docs work on `claude-sonnet-5-5`.
- **It may touch:** PR descriptions, labels, issues, Routines and sessions. Any repo change goes to a session with a brief.
- **First, in this order:**
  1. `list_triggers`: delete "Final Call: coordinator heartbeat" (`trig_01GjWcW7Mp295s5oCywQafC7`) and any other Routine bound to `session_01GnLSn9mHsUYxPjZiqbmLpC`, then `archive_session` it.
  2. Book your own hourly heartbeat (playbook §11).
  3. Sweep.
  4. Check that the release 37 session committed this brief as `docs/briefs/coordinator-2026-09-30.md`. If it didn't, have your first session do it.

## Read first

- The project notes, the `coordinator`, `steward` and `release` playbooks, `docs/specs/terminal-place.md` (order of work, speed budget, checks), and `node tools/graph.mjs brief`.

**Where things stand at 01:20 UTC on 30 Sep.**

- **Merged since the 29 Sep (a) handover:**

| PR | What | Model | Cost |
| --- | --- | --- | --- |
| #176 | Coordinator's look back for release 35 | cheaper | $0.88 |
| #177 | Balance compare with the merge base, bot `--why` (#167) | cheaper | $2.49 |
| #178 | Overgrow's lessons into the playbooks (Overgrow's session) | cheaper | – |
| #179 | Lessons tidy (61 files to 55) | cheaper | $1.19 |
| #180 | Roadmap tab on What's new (#137) | cheaper | $5.28 |
| #181 | The roof terrace floor (#133 step 4) | default | $23.38 |
| #182 | Release 36 | cheaper | $2.21 |
| #183 | Windows and watchers (#133 step 3) | default | $17.10 |
| #184 | Decor and local character (#133 step 3) | default | $11.74 |

- **Estimates:**
  - The cheaper model came in well under on every routine batch (the Roadmap tab $5.28 of $10, release 36 $2.21 of $5).
  - The default model ran at or a little over on terminal parts: the terrace $23 of $25, windows $17 of $14, decor $12 of $16.
  - Budget terminal parts at about $16–25.
- **The owner's calls:**
  - #167: defaulted to yes and built in #177. Label a PR `refactor` or `balance` for the merge-base compare.
  - #168: defaulted to no change, and closed.
  - #154's O1–O4 wait for after the terminal work.
  - The owner declined a release-branch workflow (29 Sep); don't raise it again.
- **Lessons:** #179 tidied to 55; three or four are new since (#181, #183 and decor's). Start the next tidy when `node tools/join.mjs` says 8 or more.
- **Tool quirk:** the GitHub MCP's `list_pull_requests` reports `merged: false` for merged PRs. Confirm merges with `git log origin/main`.
- **Overgrow** (`KyleLookingAround/overgrow`) has its own coordinator (coordinator 4, `session_01NfXeqh8WjATcbXpjAWvawZ`). Leave it alone unless it stalls on the usage limit.

## Speed budget

None for the coordinator. The terminal parts' shares are in `docs/specs/terminal-place.md` ("Speed budget"); each part's PR has the latest `main` numbers for the next brief.

## Commit author

KyleLookingAround <KyleMck10@hotmail.com> (the coordinator commits nothing itself).

## Who merges and when

- Every session merges its own PR: look back, ready, auto-merge (squash) once Checks, Description and, where play moved, Balance are green. Then it confirms the Pages publish.
- Read each PR's title and description for attribution before it merges (playbook §3).

## What's left for others

- Anything not listed above waits for the owner. When you hand over, ask the owner to start the next coordinator themselves, rather than starting it from a coordinator.

## When to stop and ask

- Only for something irreversible or outside this brief.
- Otherwise, if it truly needs the owner: open an issue labelled `needs-owner` with the question and the option it will take by default, take the default after 12 hours, and say so here. Where it's merely unclear, take the safer option.

## Cost budget

- Estimate: about $15 for the coordinator (the rest of the terminal wave's briefs and sweeps, two releases).
- At each check-in, read `get_session` for each session: `usage.cost_usd`, `context_usage.used_tokens`, `rate_limit_info`.
- Past twice the estimate or about 330k of context, hand over with a brief like this one, and ask the owner to start the next coordinator.
