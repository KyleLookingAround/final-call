---
type: Brief
---
# Brief: Coordinator, 28 Sep 2026 from 10:15 UTC

A handover from `session_01NXW14vbEUuuKJ7Afzmici2` (420k of context and $19 by 10:10, past its 330k line). Follow the `coordinator` playbook and `docs/briefs/coordinator-2026-09-28.md` (on `main`), with the changes below. Where they differ, this brief wins.

## Goal and what it may touch

- Run the last of the night's sessions to merged PRs, get the tidy through, and keep the owner informed in this conversation. **The owner has delayed the launch by a few days: there is no cut-off any more.** The cost rules stand: a session past twice its estimate finishes or stops, and nothing new starts without the owner asking.
- **What's live:** releases 33 and 34 are published (https://kylelookingaround.github.io/final-call/). Merged this morning after 34: #125 (runbook pack, `npm run pack`), #124 (polish, the first minute on a phone, closes #103), #122 (anonymous usage counts). Those three, plus whatever merges below, go into release 35: one release a day at most, so **start the release 35 session no earlier than 29 Sep 09:00 UTC**, on the cheaper model, from the `release` playbook.
- It may touch directly: PR descriptions, labels, issues, Routines and sessions. Any repo change goes to a session with a brief.
- **First, in this order:** (1) `list_triggers`: nothing may still be bound to `session_01NXW14vbEUuuKJ7Afzmici2`; then `archive_session` it. (2) Sweep. (3) Book one check-in, then every 30–40 minutes while sessions run; every 2 hours once only the tidy is left.

## Read first

- The project notes, the `coordinator`, `steward` and `release` playbooks, `docs/briefs/coordinator-2026-09-28.md`, and `node tools/graph.mjs brief`.

**Where things stand at 10:10 UTC.**

| Session | Item | PR | State, cost |
| --- | --- | --- | --- |
| `011JCSBdotGPETceXi5rEmsP` | Phone bugs #119 #120 #121 (owner's screenshots) | #127 (draft) | cards and mover fixed; walls fix in progress; cheaper model, $8 estimate |
| `01NM86ajQQ6Bea2VzTH4oCr5` | A network you have to keep | #116 | CI on a new head; check-in booked 10:20; finish only ($27 against $14) |
| `01Wg9EWf6qvhzMmxxAkEuhem` | Late runners | #110 (draft) | told at 10:08 to mark ready and merge if green, else comment and stop ($39 against $14) |
| `011MAdNbrtxzdDXk4NYnKc2N` | Usage counts | #122 merged 10:03 | archive once its Pages run is green |
| `01YGtc5uZK8g52jjniY3g2uQ` | Polish, first minute | #124 merged 09:59 | archive once its Pages run is green ($46 against $8: the night's worst overrun; its look back is on `main`) |
| lessons tidy Routine `trig_01WWjSqun7aAX15iLCb4PQdc` | fired 10:01 by #124's look back (23 lessons new) | not yet | a fresh session with no connectors: if it can't push or open its PR, say so to the owner and leave the tidy for a session started by hand with a brief |

- Sessions merge their own PRs. Wake an idle session with an open PR and no check-in booked (`create_trigger`, `persistent_session_id`, `run_once_at` a minute or two ahead).
- **Routines.** The watchdog (`trig_01BTgHU2LFEezyrUWk9QLL3M`) fires but can't reach the session tools (Routines made from a session store no connectors here), so it woke nobody after the 05:45–08:50 usage-limit stall; the owner has been asked to recreate it from the Routines page with Claude Code Remote attached and delete the old id. The launch-day triage Routine exists **disabled** as `trig_0135hj7Qp1ghV6U23gtUR9WZ` with the same limitation; the owner enables or recreates it on launch day. When the owner reports a new watchdog id, start one small cheaper-model session to put both ids in the `coordinator` playbook (§10–11) and, if the tidy Routine also failed for the same reason, note that too.
- **Start nothing else** unless the owner asks in this conversation. Candidates they may pick from: the remaining polish batches from `docs/ideas/polish-launch.md`, the idea board, refactor 7 and the terminal-place parts (`docs/briefs/` has their part briefs from #113).

## Speed budget

None for the coordinator.

## Commit author

KyleLookingAround <KyleMck10@hotmail.com> (the coordinator commits nothing itself).

## Who merges and when

- Every session merges its own PR with Squash and merge once Checks, Balance and Description are green on a head up to date with `main`, then confirms the Pages publish (which now runs `npm run check` on `main` first; a red one opens a "main is red" issue).
- The first session this coordinator starts commits this brief as `docs/briefs/coordinator-2026-09-28b.md`; if it starts none today, the release 35 session does.

## What's left for others

- After this: release 35 on 29 Sep; the lessons tidy if the Routine failed; refactor 7 and the terminal-place parts; refactor 10; the systems review's proposals 9, 8 and 2; the rest of the idea board; GitHub's merge queue; `docs/ROADMAP.md`.
- Tell the owner in this conversation when #127, #116 and #110 have merged or stopped, with one line each, and the running cost.

## When to stop and ask

- Only for something irreversible or outside this brief.
- Otherwise, if it truly needs the owner: open an issue labelled `needs-owner` with the question and the option it will take by default, take the default straight away, and say so here. Where it's merely unclear, take the safer option (easier to undo, or changing the game less).

## Cost budget

- Estimate: about $6 (a few hours of sweeps at `limit: 12`, three PRs to see home, one small session to start).
- At each check-in read `get_session`: `usage.cost_usd`, `context_usage.used_tokens`, `rate_limit_info`. On `allowed_warning` start nothing new. On "rejected" or `isUsingOverage`, `send_later` a minute after `resetsAt` and end the turn. The account's five-hour window resets at 13:50 UTC; the last one stalled everything for three hours, so keep sessions few.
- Past twice the estimate or about 330k of context, hand over with a brief like this one.
