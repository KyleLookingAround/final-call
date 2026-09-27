# Brief: Coordinator, from 27 Sep 2026 17:00 UTC

The handover brief for a fresh coordinator. The previous coordinator (`session_01D3SaEzco2RvbabJbz7WpR9`) hands over at 345k of context and $9.30. Follow the `coordinator` playbook (`.claude/skills/coordinator/SKILL.md`) with the changes below. The brief wins where they differ.

## Goal and what it may touch

- Run the Final Call sessions to merged PRs: sweep at each check-in, start new sessions from briefs, keep one check-in booked.
- It may touch, directly: PR descriptions (remove footers and session links); PR labels; `needs-owner` issues (answer from the briefs, or route to the owner); Routines (check-ins) and sessions (start, message, archive). Any change to the repo's files goes to a session with a brief, never to this conversation.
- **First, in this order:**
  1. **Retire the old coordinator.** `list_triggers` must show nothing bound to `session_01D3SaEzco2RvbabJbz7WpR9`; then `archive_session` it.
  2. **Archive the release session** `session_01LxkWJQjExz8QB88SBdNc9Z` once the Pages publish for release 32 (7b0b66b, PR #68) shows success.
  3. **Sweep** (the playbook's list). The only live session is the polish audit (below).
  4. **Start two sessions from briefs** (owner's default, 27 Sep): "The terminal as a place" checks-first PR (default model; spec `docs/specs/terminal-place.md`, approved on #48; its checks are planned first with a pending list) and faster CI experiment [B] second half (cheaper model: run only the check groups `tools/graph.mjs` says a change touches, on draft PRs). They touch different files; run them side by side.
  5. **Book one check-in.** Later check-ins go every 30–60 minutes while PRs are open.

## Read first

- The project notes, the `coordinator`, `steward` and `feature` playbooks, `docs/specs/terminal-place.md` ("Order of work"), and `docs/specs/systems-review.md` Part 3 and "Recommended order".
- `node tools/graph.mjs brief`, and only what it lists.

**Where things stand at 17:00 UTC.**
- **Merged today (this coordinator):** #61 weather; #67 real airport together (version 31, with the owner's Roof button: the roof is a floor you step up to); #63 clear roofs; #66 systems review; #54 Ko-fi; #47 reviewer step; #64 update toast; #68 release 32. No PRs are open.
- **The owner's answers (27 Sep, 15:20):** the Roof button was theirs; the systems review is approved in full (#65 closed; spec now says Approved); idea round 4 dropped (#62 closed); yes to release 32 (done). At 16:45 they asked how to make the game feel polished and chose a polish loop: an audit that only lists, then small fix batches.

| Session | Item | PR | Model, estimate | Who merges |
| --- | --- | --- | --- | --- |
| `017bfAy4YrGKprBcimixNCgp` | Polish audit: ranked punch list in `docs/ideas/polish-2026-09.md`, one `polish` issue per fix batch, nothing fixed | not open yet (`feature/polish-audit`) | cheaper, $6 | itself |

- **Rules still in force:**
  - The owner allowed small changes and runbook improvements without asking first.
  - Sessions book their own check-ins for their own PRs; several today forgot and stalled (#47 waited on CI that never started, #64 waited on a merge that had happened). At each sweep, an idle session with an open PR and no booked check-in gets woken.
  - Give the brief as the session's first message (`create_session` `prompt`), never a placeholder.
  - Merge-chasing was today's biggest cost: Ko-fi $27.83 on a $6 estimate, weather $22.43, update toast $15.32. Order sessions that touch `docs/LESSONS.md`, `docs/SYSTEMS.md`, `docs/ROADMAP.md` or the project notes so few are open at once, and tell each to merge `main` in once, just before merging.

## Speed budget

None for the coordinator. The terminal-place parts will have their own budget in their spec; merge nothing over it.

## Commit author

KyleLookingAround <KyleMck10@hotmail.com> (the sessions it starts set it with the session-start hook; the coordinator commits nothing itself).

## Who merges and when

- Every session merges its own PR with Squash and merge once Checks, Balance and Description are green on a head up to date with `main`, then confirms the Pages publish.
- Polish fix batches start after the audit merges, one fresh session per batch (cheaper model unless a batch touches drawing or the simulation), ordered round "The terminal as a place" so none edits the same files as an open terminal PR.

## What's left for others

- "The terminal as a place": its checks-first PR, then its groundwork (which may take refactor steps from the systems review), then its parts.
- The second half of faster CI (experiment [B]).
- The polish fix batches, from the audit's issues.
- Then the systems review's design proposals in its recommended order, the idea board (`docs/ideas/board-2026-09.md`) and `docs/ROADMAP.md`.
- A release after the terminal-place parts merge is the owner's call: ask them then.
- Routine jobs go to the cheaper model (experiment [C]). Pass this list on in every brief.

## When to stop and ask

- Only for something irreversible or outside this brief.
- Otherwise, if it truly needs the owner: open an issue labelled `needs-owner` with the question and the option it will take by default, carry on, look at it at each check-in, and take the default after 12 hours with no answer.
- Answer a session's `needs-owner` issue yourself when its brief or the spec settles it; otherwise leave it for the owner and let its default stand.
- Where it's merely unclear, take the safer option (easier to undo, or changing the game less).

## Cost budget

- Estimate: about $10 until the terminal-place checks-first PR, faster CI [B] and the polish audit have merged and the first polish batches have started.
- At each check-in, read `get_session`: `usage.cost_usd` against the estimate, `context_usage.used_tokens` and `rate_limit_info`. If status is "rejected" or `isUsingOverage` is true, schedule a `send_later` for a minute after `resetsAt` and end the turn.
- PR event notifications and archive results are long and fill context fast; subscribe only to PRs the coordinator merges, and read `list_sessions` output through a script, not whole.
- Past twice the estimate, or past about 350k of context, hand over to a fresh coordinator with a brief like this one, and retire this one.
