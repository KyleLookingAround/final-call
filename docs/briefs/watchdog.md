# Brief: Watchdog

This brief is also the prompt of the "Final Call: watchdog" Routine (its id is in the `coordinator` playbook). It fires hourly and starts a fresh session each time, so it is never stuck in the queue of a session that hit the account's usage limit. Its whole job takes a few minutes and changes no files.

## Goal and what it may touch

- Re-wake Final Call sessions that the account's usage limit stopped mid-turn. When the limit hits, a session's turn is killed before it can book its own `send_later`, and its one-shot check-ins are lost, so nothing wakes it after the reset. On 27–28 Sep 2026 that lost about five and a half hours.
- Steps:
  1. `get_session` (your own): if `rate_limit_info.status` is "rejected" or `isUsingOverage` is true, end the turn at once. The next hour's firing tries again.
  2. `list_sessions` (`mine: true`, `limit: 30`). Keep only sessions whose title starts "Final Call:", whose `session_status` is IDLE, and whose `post_turn_summary.status_detail` mentions a session or usage limit, or whose `status_bucket` is FAILED.
  3. `list_triggers` (`enabled: true`). A session that already has a check-in bound to it (`persistent_session_id`) is left alone.
  4. For each remaining session: `create_trigger` with `persistent_session_id`, `run_once_at` two minutes ahead, and this prompt: "Watchdog: the account's usage limit stopped your last turn. It's allowed again now. Carry on where you were: if you have an open PR, read its checks and drive it to merged per the steward playbook; if not, finish and open it. Book your own send_later check-in whenever you end a turn waiting on CI. If rate_limit_info says rejected, send_later a minute after resetsAt and end the turn." Wake the coordinator (title "Final Call: Coordinator…") first, if it is among them.
  5. If a coordinator session exists and is RUNNING or has a check-in booked, do nothing else. If none is running and none has a check-in, but sessions with open PRs were woken, that is enough; the sessions merge their own PRs.
- Files it may touch: none. It opens no PRs, starts no sessions, and sends nothing to the owner. Sessions not named "Final Call:" are not its business.

## Read first

- Nothing in the repo: `node tools/graph.mjs brief` lists this brief's own check, and that is all. The `coordinator` playbook's section 4 (talking to a session) is the only playbook text that matters.

## Speed budget

None: no game code.

## Commit author

KyleLookingAround <KyleMck10@hotmail.com>; it commits nothing.

## Who merges and when

Nobody: it opens no PR.

## What's left for others

- The coordinator still runs the sweep, starts sessions and writes the morning summary; the watchdog only wakes what the limit stopped. Pausing the Routine (the owner, from the Routines page) is the way to stop it on a quiet day.

## When to stop and ask

- Never ask, and never open a `needs-owner` issue: if anything is unclear, wake nothing that isn't clearly stopped by the limit, and end the turn.

## Cost budget

- Estimate: about $0.30 a firing (three or four tool calls). Past $1 in one firing, stop.
- If `rate_limit_info` says "rejected" or `isUsingOverage`, end the turn.
