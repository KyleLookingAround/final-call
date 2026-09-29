# Brief: Coordinator, from release 35 through launch week and the terrace

A handover from `session_015T9o1ovutWffunu6oYS7ui`, the coordinator that took the game to release 35 on 29 Sep. This is the state at 10:00 UTC on 29 Sep. Follow the `coordinator` playbook, with the changes below; where they differ, this brief wins.

## Goal and what it may touch

- **Where the game is:** release 35 ("Two floors and a clearer climb") is live at https://kylelookingaround.github.io/final-call/ (Pages green at 09:48, 22c0903). The owner's goal of 28 Sep is met: two floors in Classic, the release audit's batches, the docs and a polished release. The owner is about to share it with the wider public. The feedback so far is that it "really scratched a brain itch": protect that.
- **The plan, in order:**
  1. **Launch week.** Once the owner says they've shared it (or from the first player-filed issue, whichever comes first), start launch-day triage by hand every two hours (`coordinator` playbook §12: `create_session` on the cheaper model with `docs/briefs/launch-triage.md`). Follow the `release` playbook's launch-week rules: one release a day at most, hotfixes excepted, and no new systems for 48 hours after the launch post. Small, clear bugs players report come first.
  2. **The roof terrace** (#133 step 4, the owner cares most about it), from `docs/specs/terminal-place.md`, then windows, decor and each layout's own floor plan (steps 5–6). Only after the 48-hour window, one part at a time in the spec's order.
  3. **The Roadmap tab** (#137, spec approved in #142).
  4. **Refactors 8 and 10,** in a quiet window with no feature sessions open.
  5. `docs/ROADMAP.md` kept current, and the players' roadmap page (https://claude.ai/artifact/6eT5NjK6QonjBduTh8x2XN; only the conversation that last published it can republish without the URL, so pass `url`, after `action: "read"`) updated after each release.
- **Usage:** the owner said to ignore `allowed_warning`. On `rejected`, the five-hour limit kills every turn and nothing wakes the sessions: book a `send_later` for a minute after `resetsAt` and wake each stalled session then, two minutes apart (`create_trigger` with `persistent_session_id` and `run_once_at`). B1 hit it at 05:14 on 29 Sep with four default-model sessions and three cheaper ones running. Keep at most three default-model sessions at once, and put small, routine and docs work on `claude-sonnet-5-5`.
- **It may touch:** PR descriptions, labels, issues, Routines and sessions. Any repo change goes to a session with a brief.
- **First, in this order:**
  1. Run `list_triggers`, delete any Routine still bound to `session_015T9o1ovutWffunu6oYS7ui` (its heartbeat was already deleted at 09:56), then `archive_session` it.
  2. Book your own hourly heartbeat (playbook §11).
  3. Sweep. Nothing should be open: no PRs, and every session from 29 Sep is archived.
  4. Have your first session commit this brief as `docs/briefs/coordinator-2026-09-29b.md`.

## Read first

- The project notes, the `coordinator`, `steward` and `release` playbooks, `docs/briefs/launch-triage.md`, `docs/specs/terminal-place.md`, and `node tools/graph.mjs brief`.

**Where things stand at 10:00 UTC on 29 Sep.**

- **Merged on 29 Sep** (every session archived):

| PR | What | Cost |
| --- | --- | --- |
| #162 | Two floors in Classic | $30.13 |
| #164 | P4 numbers, labels and the save panel | $2.70 |
| #165 | P3 small screens and landscape | $5.39 |
| #166 | F1 tips that point the right way | $12.87 |
| #169 | Lessons tidy (84 files to 50) | $5.69 |
| #170 | Terminal polish (labels, better shops, weather reads) | $11.87 |
| #171 | B1 level pacing (bot runs 1,200 h; seed 1 unstuck) | $12.57 |
| #172 | Loose ends (phone camera margin, Crews and Routes notes) | $4.65 |
| #174 | README Play link and docs against the code | $2.95 |
| #175 | Release 35 | $2.21 |

- **Estimates ran close for well-scoped batches on either model.** The cheaper model finished release 35 at $2.21 of $10 and loose ends at $4.65 of $6. The default model came in near its estimate on F1 and B1.
- **Pacing after B1:** levels 5, 7 and 9 arrive 4–13% sooner than the baselines (all `near`, within 15%). The baselines were left unchanged; if the owner wants the faster mid-game kept, level 5's range is the one to move.
- **The owner's calls, #154:** O1 (planes leave hours before the board's time) defaulted to after release; recommend it as its own batch in `05`, `08` and `46` once launch week settles, and only if the owner says yes. O5 (staff pay): the terminal pass measured it and left it unchanged (tables and a proposal on #154). O2–O4: after release.
- **Needs-owner issues from the lessons tidy:** #167 (the Balance workflow printing `main`'s `PLAY`, and a `--why` summary in the bot) and #168 (how far sessions trust relayed owner messages). Their 12-hour defaults fall due at about 16:35 UTC on 29 Sep: take them then and say so on each issue.
- **The owner declined a release-branch workflow** (29 Sep, 07:30). Don't raise it again.
- **Lessons:** #169 tidied to 50; about 8 are new since, from the release batches. Start the next tidy when `node tools/join.mjs` says 8 or more.
- **Overgrow** (`KyleLookingAround/overgrow`) is the owner's other game, with its own coordinator (`session_01Aq8H4VdiARDjwRdXECDHQy` at 05:00). Leave it alone unless it stalls on the usage limit; then wake it the same way.

## Speed budget

None for the coordinator. The release's baseline is in the audit's "Speed" table (`docs/ideas/release-audit.md`); every brief carries it.

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

- Estimate: about $15 for the coordinator (launch-week sweeps and triage starts, then the terrace wave's briefs).
- At each check-in, read `get_session` for each session: `usage.cost_usd`, `context_usage.used_tokens`, `rate_limit_info`.
- Past twice the estimate or about 330k of context, hand over with a brief like this one, and ask the owner to start the next coordinator.
