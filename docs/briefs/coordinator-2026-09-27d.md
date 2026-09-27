# Brief: Coordinator, from 27 Sep 2026 19:55 UTC

The handover brief for a fresh coordinator. The previous coordinator (`session_01B33HgcCzZKJAqWZsqZomaf`) hands over at 320k of context and about $7. Follow the `coordinator` playbook (`.claude/skills/coordinator/SKILL.md`) with the changes below. The brief wins where they differ.

## Goal and what it may touch

- Run the Final Call sessions to merged PRs: sweep at each check-in, start new sessions from briefs, keep one check-in booked.
- It may touch, directly: PR descriptions (remove footers and session links); PR labels; issues (close ones a merged PR fixed but GitHub didn't auto-close; `needs-owner` ones: answer from the briefs, or route to the owner); Routines (check-ins) and sessions (start, message, archive). Any change to the repo's files goes to a session with a brief, never to this conversation.
- **First, in this order:**
  1. **Retire the old coordinator.** `list_triggers` must show nothing bound to `session_01B33HgcCzZKJAqWZsqZomaf`; then `archive_session` it.
  2. **Sweep** (the playbook's list). Live sessions are in the table below. Archive each whose PR has merged once its Pages publish succeeds, and delete any check-in still bound to it.
  3. **Start refactors 4 and 6 in one session** (default model): `docs/specs/systems-review.md` Part 3 steps 4 (hook tables for the clocks) and 6 (day stats as a registry). Its blockers (#85 effects, #86 saves) have merged. It must keep `TERM_MINUTE` as an alias, put its checks in new files in `tools/checks/`, and keep `PLAY` identical on seeds 1–3. Estimate about $10.
  4. **When #83 has merged:** start the terminal-place groundwork (default model), step 2 of `docs/specs/terminal-place.md`'s "Order of work", with the systems review's refactor 9 (`12-drawing.js` as layers) as its first commit. It switches on the groundwork's pending checks from #90 and writes the parts' briefs. Order it round refactors 4+6 (both touch registrations; the groundwork registers into `TERM_MINUTE`).
  5. **When #92 has merged:** refactor 8 (weather in one place), cheaper model unless it touches drawing.
  6. **A small docs session (cheaper model)** once things are quiet: the project notes' rebuild figures are stale (`main` rebuilds to level 9 at game hour 975–989 on seeds 1–3, not 953–966; from #89's look back), and its follow-up on moving walkways (read #89's look back and PR).
  7. **Book one check-in.** Later check-ins go every 30–45 minutes while PRs are open.

## Read first

- The project notes, the `coordinator`, `steward` and `feature` playbooks, `docs/specs/terminal-place.md` ("Order of work"), and `docs/specs/systems-review.md` Part 3 and "Recommended order".
- `node tools/graph.mjs brief`, and only what it lists. The briefs this coordinator wrote are on `main` in `docs/briefs/` (each session commits its own): copy their shape.

**Where things stand at 19:55 UTC.**
- **Merged today since 17:00 (all published, sessions archived):** #77 polish audit (29 findings, issues #69–#76); #84 phone chrome and touch targets (#69–#72); #87 overlay cards (#74); #90 terminal-place checks first, with refactor 1; #80 reports and the region at night (#76); #81 refactor 2, routes in one file; #89 passenger movement (#82: the people mover's 2.5× pace drawn as walkers; now riders are drawn on the cars and drawn movement eases); #86 refactor 5, save migration as a table; #85 refactor 3, one effects ledger.
- **Owner's asks today:** a polish loop (17:00 brief); at 17:20 "come up with a bunch of ways to polish the game including the systems upgrade, as many as we can quickly and simultaneously"; at 17:23 fix passengers who suddenly speed down the terminals (done, #89).

| Session | Item | PR | Model, estimate | Who merges |
| --- | --- | --- | --- | --- |
| `01LtRdHbiGAiN4pRn4Yk4Srq` | Faster CI [B] second half | #79 | cheaper, $5 (at $16.67: let it finish, nothing more) | itself |
| `01SVNG1gLNMFrhMB5dNFVeu4` | Bug #78, rebuilding twice | #83 (blocked on a `docs/SYSTEMS.md` conflict; retrying hourly) | default, $6 | itself |
| `01GWFfSDAEzVzUDbVEZK5weR` | Polish #73, Masterplan | #88 | cheaper, $5 | itself |
| `011MouyB94tFGXSCooETWSaS` | Polish #75, less noise | #92 | cheaper, $6 | itself |

- **Not this coordinator's:** #93 (workflows run only when needed) and #94 (one file per entry, so sessions stop clashing on `docs/LESSONS.md` and other shared lists) come from the owner's other sessions, as does the poke-only "Final Call: tidy the lessons" Routine (`trig_01WWjSqun7aAX15iLCb4PQdc`). Leave them alone. Once #94 merges, look backs go where it says: tell every new session so.
- **Open question to the owner (asked 17:25, no answer yet):** audit rows 4 (the rating pinned at 100 from day 2; #57 idea 1) and 5 (most departures to one city; proposal 1) change pacing and need new baselines. Default: don't start them; when refactors 4+6 have merged, open a `needs-owner` issue proposing one session that measures both with the bot and brings the new numbers to the owner before anything ships.
- **Rules still in force:**
  - The owner allowed small changes and runbook improvements without asking first.
  - Sessions book their own check-ins; at each sweep, wake an idle session with an open PR and no booked check-in (a `create_trigger` with `persistent_session_id` and `run_once_at` a minute or two ahead).
  - Give the brief as the session's first message (`create_session` `prompt`), never a placeholder.
  - Merge-chasing is still the biggest cost: with 13 sessions at once, several PRs merged `main` three or four times. Run at most about five sessions at once, and tell each to merge `main` in once, just before merging. GitHub sometimes starts no pull-request run after a push; sessions work round it with `workflow_dispatch`.
  - GitHub closes only the first issue in "Closes #a, #b": close the rest by hand after a merge.

## Speed budget

None for the coordinator. The terminal-place parts will have their own budget in their spec; merge nothing over it.

## Commit author

KyleLookingAround <KyleMck10@hotmail.com> (the sessions it starts set it with the session-start hook; the coordinator commits nothing itself).

## Who merges and when

- Every session merges its own PR with Squash and merge once Checks, Balance and Description are green on a head up to date with `main`, then confirms the Pages publish.
- The first session this coordinator starts commits this brief as `docs/briefs/coordinator-2026-09-27d.md` in its PR.

## What's left for others

- Refactors 4 and 6, then 10 (after 3 and 4); refactor 8 after #92; refactor 7 between the terminal-place groundwork and its parts.
- "The terminal as a place": its groundwork (with refactor 9), then its parts in two batches, then bringing it together.
- The systems review's proposals 9, 8 and 2, then the owner's answer on the rating and the one-city board, then the idea board (`docs/ideas/board-2026-09.md`) and `docs/ROADMAP.md`.
- A release after the terminal-place parts merge is the owner's call: ask them then.
- Routine jobs go to the cheaper model (experiment [C]). Pass this list on in every brief.

## When to stop and ask

- Only for something irreversible or outside this brief.
- Otherwise, if it truly needs the owner: open an issue labelled `needs-owner` with the question and the option it will take by default, carry on, look at it at each check-in, and take the default after 12 hours with no answer.
- Answer a session's `needs-owner` issue yourself when its brief or the spec settles it; otherwise leave it for the owner and let its default stand.
- Where it's merely unclear, take the safer option (easier to undo, or changing the game less).

## Cost budget

- Estimate: about $10 until refactors 4+6, the terminal-place groundwork and the four open PRs above have merged.
- At each check-in, read `get_session`: `usage.cost_usd` against the estimate, `context_usage.used_tokens` and `rate_limit_info`. `allowed_warning` means start nothing new; if status is "rejected" or `isUsingOverage` is true, schedule a `send_later` for a minute after `resetsAt` and end the turn.
- PR event notifications and archive results are long and fill context fast; subscribe only to PRs the coordinator merges, and read `list_sessions` output through a script, not whole.
- Past twice the estimate, or past about 330k of context, hand over to a fresh coordinator with a brief like this one, and retire this one.
