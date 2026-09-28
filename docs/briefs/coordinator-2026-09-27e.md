# Brief: Coordinator, overnight from 27 Sep 2026 21:45 UTC

A handover to a fresh coordinator. The previous one (`session_01VU2syqUPKrTY7WbcC7hqdc`) hands over at 320k of context and about $8. Follow the `coordinator` playbook (`.claude/skills/coordinator/SKILL.md`), with the changes below. Where they differ, this brief wins.

## Goal and what it may touch

- Run tonight's Final Call sessions to merged PRs, so the owner wakes on 28 Sep to a polished game with new things in it, and a release with a What's new card. They start posting and sharing it that day.
- **The owner's words tonight (27 Sep, 21:00–21:40):**
  - "overnight keep working on polishing the game, balancing, making it look good, feel good, consider moving thing in the menus, anything really. the region map could do with looking better. you can also change control how many active sessions you have going yourself and create new coordinaters when it makes sense"
  - "try not to wait on me too much, you can make the game feel longer so long as there's something for the player to do. I'd like to see some cool updates when I wake up"
  - "don't make any more changes after 7am … you can finish anything off from then"
  - "I don't like how the buttons at the top go over 2 rows on mobile. it looked better earlier"
- **The cut-off:** 7am is read as UK time, 06:00 UTC, the earlier and safer reading. From 06:00 UTC, start no new session and no new work. Sessions already running may finish and merge what they started. Start big work only before about 03:30 UTC, and small fixes only before about 05:00.
- It may touch directly: PR descriptions (remove footers and session links), labels, and issues (close ones a merged PR fixed but GitHub didn't auto-close). It also manages Routines (check-ins) and sessions (start, message, archive). Any change to the repo's files goes to a session with a brief, never to this conversation.
- **First, in this order:**
  1. **Retire the old coordinator.** `list_triggers` must show nothing bound to `session_01VU2syqUPKrTY7WbcC7hqdc`; then `archive_session` it.
  2. **Sweep** (the playbook's list). Archive each session whose PR has merged, once its Pages publish succeeds (docs-only and workflow-only merges don't publish), and delete any check-in still bound to it first.
  3. **Book one check-in**, then every 30–45 minutes through the night.

## Read first

- The project notes, the `coordinator`, `steward`, `feature` and `release` playbooks, and `docs/ideas/board-2026-09.md` ("The owner's order").
- `node tools/graph.mjs brief`, and only what it lists. Tonight's briefs are committed by each session in its PR (`docs/briefs/`); copy their shape for new ones. The board-idea briefs (`late-runners`, `photo-mode`, `day-in-a-minute`, `famous-faces`) share one shape: reuse it.

**Where things stand at 21:45 UTC.** Merged tonight: #83, #88, #92, #95 (refactors 4+6), #79, #97, plus the owner's #93 and #94.

| Session | Item | PR | Model, estimate |
| --- | --- | --- | --- |
| `017gneCth89PPzaCiWkS53Wg` | Terminal-place groundwork, with refactor 9 (writes the first parts' briefs) | not yet | default, $18 |
| `01RbHtkifRjwyi4F81wVQM9g` | Refactor 8, weather in one place | #98 | default, $8 |
| `01VmVwCaK7VTSBqrTBbGBHDn` | Launch polish audit: opens `polish` issues, one per fix batch | not yet | default, $10 |
| `018BWv4fSJ3dHAn96PMVRZ2T` | The region map, looking better | not yet | default, $14 |
| `01NM86ajQQ6Bea2VzTH4oCr5` | The rating over the last day (answers #96: may ship on, new baselines, level 9 no later than about game hour 1,400); then a network you have to keep, only if its PR opens by 03:30 | #101 | default, $14 |
| `01Wg9EWf6qvhzMmxxAkEuhem` | Late runners, and a passenger's story (file 61) | issue #99 | default, $14 |
| `01PWcBUu9q8tVcPJCFBAnpyF` | Photo mode (62); told to keep its camera button off the phone's top bar | #100 | default, $10 |
| `01A9E4hP7Mvdxhn12Jyk29gM` | Day in a minute (63) | #102 | default, $16 |
| `01AdiJDKjLbE9SVFZJWGyTvu` | Famous faces (64) | not yet | default, $12 |
| `01QcAcdd4xFeLRUFB1MmEXQQ` | **The phone's top bar back on one row** (the owner's complaint; top priority) | not yet | default, $5 |

- **#96** (`needs-owner`): the owner answered it tonight (above). Remove the label; the balance session closes #96 when its PR merges.
- **Not this coordinator's:** the "Final Call: tidy the lessons" Routine (`trig_01WWjSqun7aAX15iLCb4PQdc`), fired by sessions at 8 new lessons. Leave it alone.

## Next, in order, as sessions finish (about 10 at once at most, fewer as merges land)

1. **The launch audit's fix batches**, one session per `polish` issue, each with its own brief. No two batches share a file, and none touches the groundwork's files until the groundwork merges. Use the cheaper model (`claude-sonnet-5`) for small routine batches, the default for drawing or judgement.
2. **When the groundwork merges:** refactor 7 (one pass over passengers, two PRs), then the first three terminal-place parts from the briefs it wrote, labelled `part:terminal-place`. Start them only if they can open PRs well before the cut-off; otherwise leave them for the owner.
3. **More of the owner's board order**, if there's room before 03:30: Building sites you can watch, Route openings, Where to fly next, Idle camera, Your airport's story. Each goes in its own new file (65 on) with a spec written first in its PR; the owner's rating stands in for approval tonight.
4. **The release**, started by about 04:00 UTC with the `release` playbook, so it merges by about 05:30. It claims the next version, folds every fragment in `src/updates.d/` into What's new and `docs/HISTORY.md`, and adds save fixtures. After 06:00, one small final release may fold in fragments from work that was already running.
5. **A morning summary for the owner** at the last check-in: what shipped (with PR numbers and the live link), what's waiting, the balance numbers from #101, and the night's cost.

## Rules still in force

- Every new brief carries the 06:00 UTC cut-off, the owner's wish not to be waited on (take the default), and "Routine jobs go to the cheaper model (experiment [C])".
- Look backs go in `docs/lessons/<pr>-<short-name>.md`, and system notes in `docs/systems/` (one file each since #94).
- The Catch up workflow merges `main` into open PRs; sessions merge by hand only for real conflicts. GitHub sometimes starts no pull-request run after a push, so sessions dispatch Checks with `workflow_dispatch`.
- Balance runs when a PR opens or leaves draft, and when the `balance` label is added.
- Sessions book their own check-ins. At each sweep, wake an idle session that has an open PR and no check-in booked: a `create_trigger` with `persistent_session_id` and `run_once_at` a minute or two ahead.
- Give the brief as the session's first message, never a placeholder, with one line asking it to save the brief in `docs/briefs/`.
- GitHub closes only the first issue in "Closes #a, #b": close the rest by hand after a merge.
- `list_pull_requests` without `body`; archive results and PR events are long, so subscribe to nothing.

## Speed budget

None for the coordinator. Each session's brief carries its own.

## Commit author

KyleLookingAround <KyleMck10@hotmail.com> (the sessions it starts set it with the session-start hook; the coordinator commits nothing itself).

## Who merges and when

- Every session merges its own PR with Squash and merge once Checks, Balance and Description are green on a head up to date with `main`, then confirms the Pages publish.
- The first session this coordinator starts commits this brief as `docs/briefs/coordinator-2026-09-27e.md` in its PR.

## What's left for others

- After tonight: the terminal-place parts not started, then bringing them together; refactor 10; the systems review's proposals 9, 8 and 2; a network you have to keep, if not built tonight; the rest of the idea board; `docs/ROADMAP.md`.

## When to stop and ask

- Only for something irreversible or outside this brief.
- Otherwise, if it truly needs the owner: open an issue labelled `needs-owner` with the question and the option it will take by default, and carry on. The owner asked not to be waited on tonight, so take the default straight away and list it in the morning summary.
- Where it's merely unclear, take the safer option (easier to undo, or changing the game less).

## Cost budget

- Estimate: about $12 for the coordinator overnight. The sessions tonight are estimated at about $130 together, plus the fix batches.
- At each check-in, read `get_session`: `usage.cost_usd`, `context_usage.used_tokens` and `rate_limit_info`. On `allowed_warning`, start nothing new. If the status is "rejected" or `isUsingOverage` is true, schedule a `send_later` for a minute after `resetsAt` and end the turn.
- Past twice the estimate, or past about 330k of context, hand over to a fresh coordinator with a brief like this one, and retire this one.
