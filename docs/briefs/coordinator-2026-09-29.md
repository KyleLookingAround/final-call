# Brief: Coordinator, 29 Sep 2026 from about 01:00 UTC, to the public release

A handover from `session_01JtaiFWY7povechZrZ8WqD8` (465k of context by 00:30, past the 330k line). Follow the `coordinator` playbook, with the changes below. Where they differ, this brief wins.

## Goal and what it may touch

- **The owner's goal, 28 Sep:** "keep going till you have the two floors and then do a final refactor sweep, any fixes or balance fixes sweep, any easy wins, basically the game actual release at that point. Make it very polished, you can change anything to get to that point. I'll wait for you to finish before I start sharing with the wider public. Current feedback is that it 'really scratched a brain itch' so that's the aim."
- **The plan:** two floors in Classic, then the release audit's remaining batches, then release 35. Then tell the owner it's ready to share. The audit is `docs/ideas/release-audit.md` (#155), with one issue per batch, and none of the batches share a file.
- **Usage:** the owner said to ignore `allowed_warning`. On `rejected`, the five-hour limit kills every turn and nothing wakes the sessions afterwards. On 28 Sep this stalled all of them from 21:37 until 00:27. So after any `rejected`, book a `send_later` for a minute after `resetsAt` and wake each stalled session then, two minutes apart (`create_trigger` with `persistent_session_id` and `run_once_at`). Keep at most four default-model sessions running at once.
- **It may touch:** PR descriptions, labels, issues, Routines and sessions. Any repo change goes to a session with a brief.
- **First, in this order:**
  1. Run `list_triggers` and delete `trig_01Nrj3rrHVF2MqrY2j28sojH` (the old coordinator's hourly heartbeat) and any `send_later` bound to `session_01JtaiFWY7povechZrZ8WqD8`. Then run `archive_session` on it.
  2. Book your own hourly heartbeat (playbook §11).
  3. Sweep.
  4. Book one check-in, then every 30–45 minutes while sessions run.

## Read first

- The project notes, the `coordinator`, `steward` and `release` playbooks, `docs/ideas/release-audit.md`, `docs/specs/terminal-place.md`, and `node tools/graph.mjs brief`.

**Where things stand at 00:30 UTC on 29 Sep.** All the sessions below were woken at 00:28–00:36 after the stall.

| Session | Item | PR | State, cost against estimate |
| --- | --- | --- | --- |
| `0118pdGE2qspc7FCpC9JQcq6` | Two floors in Classic (#133 step 3), default model | not yet open | $12 of $25; the last feature before release; merges itself when green and within 15% pacing |
| `01J4P94WSmQ3UZeKiUDxC7x2` | R1: never freeze or lose a save (#146) | #158 | $5.65 of $10 |
| `011ki7ARFAgcCbx2cT5nWbuj` | P1: first level-up card and guided start (#150) | #157 | $11.7 of $6, finish only |
| `01MvNbBcz6sFc3AoFFosfN4J` | F2: goals and levels that lead (#149) | not yet open | $14.4 of $6, finish only |
| P2 (#151) | Records and stamps toasts, with their own chime | #159 merged | done, archived |

- **Merged on 28 Sep:**
  - #134 playbooks without Routines
  - #140 page size check
  - #141 roadmap tidy
  - #138 floors spec (Approved)
  - #144 checks refresh
  - #145 and #156 refactor 7
  - #142 Roadmap tab spec (Approved; the build waits until after release)
  - #155 release audit
  - #159 P2
- **Start after two floors merges.** Write each brief by copying `docs/briefs/release-p2.md` (the batch brief shape) and changing the batch, issue, branch, files and estimate. Run `node tools/brief.mjs` on it. Estimates run 2–3× over for the cheaper model, so set them realistically.
  - **F1** (#148): tips that point the right way. Files `16`, `04`, `32`, `34`. Default model, about $15. Changes play: seeds 1–3 before and after.
  - **B1** (#147): level pacing. Row 16 first, so the bot's runs reach level 9. Files `01`, `08`, `tools/run-bot.mjs`, `tools/health.mjs`. Default model, about $15. Rows 19 and 21 go to the owner if a level moves more than 15%.
  - **P3** (#152): small screens and landscape. Files `src/shell.html`, `13`, `14`, `19`. Cheaper model, about $12.
  - **P4** (#153): numbers, labels and the save panel. Files `03`, `15`, `12`. Cheaper model, about $10.
  - **A terminal polish pass:** the audit's "Terminal halls and floors" list, plus O5 staff pay. Default model, after two floors and before the release.
- **Then release 35,** from the `release` playbook, on the cheaper model (one release a day at most). It folds every `src/updates.d/` fragment, adds save fixtures and link previews (`npm run preview`, with the new floors), and runs a final full check on `main`. Then tell the owner the game is ready to share, with the What's new points.
- **The owner's calls, #154.** Each has a default, taken 12 hours after 19:33 on 28 Sep.
  - **O1:** planes leave a median of 2 h 19 min before the board's time at level 9. Default: after release. The old coordinator recommended fixing it before release, as its own batch in `05`, `08` and `46`, after B1 and two floors merge. Do it only if the owner says yes.
  - **Row 8, the curfew:** F2 takes the default (the requirement scales with the open hours).
  - **O2–O5:** after release.
- **Parked until after release:** windows, decor, the roof terrace floor, each layout's own floor plan (#133 steps 4–6), the Roadmap tab build (#137), and income (on hold).
- **Overgrow** (`KyleLookingAround/overgrow`) is the owner's new game. It has its own coordinator, `session_01VXFhhDdTHejQhUy63adabf`, woken at 00:36. Leave it alone unless it stalls on the usage limit, in which case wake it the same way.
- **The roadmap page** for players is `https://claude.ai/artifact/6eT5NjK6QonjBduTh8x2XN`. Update it after release 35, with the floors moved to Landed. Only the old coordinator's conversation can republish it without the URL, so pass `url`.

## Speed budget

None for the coordinator. The release's baseline is in the audit's "Speed" table.

## Commit author

KyleLookingAround <KyleMck10@hotmail.com> (the coordinator commits nothing itself).

## Who merges and when

- Every session merges its own PR: look back, ready, auto-merge (squash) once Checks, Description and, where play moved, Balance are green. Then it confirms the Pages publish.
- The first session this coordinator starts commits this brief as `docs/briefs/coordinator-2026-09-29.md`.

## What's left for others

- After release 35: the rest of #133 (the terrace first; the owner cares most about it), the Roadmap tab, O1–O5, refactors 8 and 10 in a quiet window, and `docs/ROADMAP.md`.
- When you hand over, ask the owner to start the next coordinator themselves, rather than starting it from a coordinator.

## When to stop and ask

- Only for something irreversible or outside this brief.
- Otherwise, if it truly needs the owner: open an issue labelled `needs-owner` with the question and the option it will take by default, take the default after 12 hours, and say so here. Where it's merely unclear, take the safer option.

## Cost budget

- Estimate: about $12 for the coordinator (sweeps until release, about eight briefs).
- At each check-in, read `get_session` for each session: `usage.cost_usd`, `context_usage.used_tokens`, `rate_limit_info`.
- Past twice the estimate or about 330k of context, hand over with a brief like this one, and ask the owner to start the next coordinator.
