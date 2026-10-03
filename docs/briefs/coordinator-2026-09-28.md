---
type: Brief
---
# Brief: Coordinator, 28 Sep 2026 from 05:00 UTC to the morning summary

A handover from `session_01ASSNZafGceJM9JYfR4AUUx` (about 340k of context and $15 by 05:00, model switched to `claude-fable-5-1` by the owner). Follow the `coordinator` playbook, with `docs/briefs/coordinator-2026-09-27e.md` (the overnight brief) and the changes below. Where they differ, this brief wins.

## Goal and what it may touch

- Run the rest of the night's sessions to merged PRs, get releases 33 and 34 out, and leave the owner a morning summary by about 09:15 UTC. The owner starts sharing the game today, so launch safety comes before new features.
- **The owner's decisions since the overnight brief** (all on 28 Sep, 04:00–05:00 UTC, in the previous coordinator's conversation):
  - **Cut-off moved to 09:00 UTC** ("extend the cutoff a few hours"). Big work starts only before about 06:30, small fixes before about 08:00, nothing new after 09:00; sessions already running may finish and merge.
  - **No Jev AI** ("no jev for now").
  - **#105 the other way:** bring the first level-up to about five real minutes at 1× (a session is on it), not just a 4× tip. Both are in flight; the tip stays too.
  - **Analytics on:** GoatCounter, site code `final-call` (`https://final-call.goatcounter.com/count`); a session is adding it, on by default with a Settings switch, published site only.
  - **Freeze after launch:** one release a day at most in launch week, no new systems for 48 hours after a launch post; the launch-safety session writes the rule into the `release` playbook.
  - **`CATCH_UP_TOKEN`:** the owner is adding the secret (a fine-grained token: contents, pull requests, workflows write). Once set, Catch up pushes start their own Checks runs and nobody needs to dispatch by hand.
  - **Watchdog Routine** `trig_01BTgHU2LFEezyrUWk9QLL3M` ("Final Call: watchdog", hourly at :50, fresh session): created with no connectors, so **read its first firings** (04:50, 05:50) in `list_sessions`; if it couldn't call `list_sessions`/`create_trigger`, tell the owner to recreate it from the Routines page with Claude Code Remote attached, and have a session put the new id in the playbook.
- It may touch directly: PR descriptions, labels, issues (close what a merged PR fixed), Routines and sessions. Any repo change goes to a session with a brief.
- **First, in this order:** (1) `list_triggers`: nothing may still be bound to `session_01ASSNZafGceJM9JYfR4AUUx`; then `archive_session` it. (2) Sweep. (3) Book one check-in, then every 30–40 minutes to 09:15.

## Read first

- The project notes, the `coordinator`, `steward` and `release` playbooks, `docs/briefs/coordinator-2026-09-27e.md`, and `node tools/graph.mjs brief`.

**Where things stand at 05:00 UTC.** Merged tonight: #83, #88, #92, #93, #94, #95, #79, #97, #98, #100 (photo mode), #101 (rating over the last day, closed #96), #107 (phone top bar), #112 (menus where players look, closed #104), #102 (day in a minute). Open `needs-owner`: none that need them tonight (#105 is being answered by a session).

| Session | Item | PR | Model, estimate |
| --- | --- | --- | --- |
| `017gneCth89PPzaCiWkS53Wg` | Terminal-place groundwork, refactor 9 | #113 | default, $18 (at $7) |
| `01VmVwCaK7VTSBqrTBbGBHDn` | Launch polish audit (docs) | #106 | default, $10 (at $20: past twice, told to do the minimum) |
| `018BWv4fSJ3dHAn96PMVRZ2T` | Region map restyle | #108 | default, $14 |
| `01NM86ajQQ6Bea2VzTH4oCr5` | A network you have to keep (spec in #101); PR must open by 06:30 or it stops | not yet | default, $14 |
| `01Wg9EWf6qvhzMmxxAkEuhem` | Late runners, a passenger's story | #110 | default, $14 (at $18) |
| `01AdiJDKjLbE9SVFZJWGyTvu` | Famous faces | #111 | default, $12 |
| `01Y2hcNS3FVFjHDyj4hmDyAy` | Fleet tab (#109), second PR after #112 | #115 | default, $12 |
| `01A9E4hP7Mvdxhn12Jyk29gM` | Day in a minute: merged (#102); archive once Pages published | done | |
| `01BHqvrauWfqwi3fcWhVPke4` | Release 33 (folds at 05:00, merge by ~05:45); release 34 folds ~08:15, merges by ~08:50; a tiny 35 only for fragments merging 08:15–09:30 | not yet | cheaper, $6 |
| `01PjD2tabw7n4aSR9JWyYKb5` | Playbooks: usage-limit cap (about four default-model sessions), watchdog §11, refactors not during a feature wave, sessions subscribe to their own PR, Description check strips the footer, lesson `main-overnight-stall` | #114 (draft) | cheaper, $4 |
| `01YGtc5uZK8g52jjniY3g2uQ` | Polish batch 1, the first minute on a phone (#103), with the 4× tip | not yet | cheaper, $8 |
| `01KE1zidqZxJJ5hUwdfSeR3H` | The first level-up within five minutes (#105): new early baselines, decision record | not yet | default, $12 |
| `01LxNcxk7gitHY8s4qN9WPuA` | Launch safety: `npm run check` on `main` before Pages deploys ("main is red" issue on failure), release cadence, `docs/briefs/launch-triage.md`, merge-queue roadmap item | not yet | cheaper, $5 |
| `011MAdNbrtxzdDXk4NYnKc2N` | Anonymous usage counts (GoatCounter `final-call`, six events, Settings switch) | not yet | cheaper, $5 |

- Sessions merge their own PRs. Wake an idle session with an open PR and no check-in booked (`create_trigger`, `persistent_session_id`, `run_once_at` a minute or two ahead).
- **When launch safety merges:** create the triage Routine from `docs/briefs/launch-triage.md` (every 2 hours, `create_new_session_on_fire`, model `claude-sonnet-5`, prompt = the file's text), and have a small session put its id in the `coordinator` playbook. Its first firing should be before the owner posts; if the Routine can't reach GitHub or the repo tools without connectors, say so in the morning summary rather than guess.
- **Lessons tidy** (`trig_01WWjSqun7aAX15iLCb4PQdc`): 8 or more lessons are new since the last tidy. Fire it once the feature wave has merged (about 07:00), not while ten PRs are open.
- **Start nothing else.** Refactor 7 and the terminal-place parts wait for the owner even if #113 merges; the concurrency cap is in force from now: at most about four default-model sessions doing new work at once (there are more than that finishing; start new ones on the cheaper model only).

## Speed budget

None for the coordinator.

## Commit author

KyleLookingAround <KyleMck10@hotmail.com> (the coordinator commits nothing itself).

## Who merges and when

- Every session merges its own PR with Squash and merge once Checks, Balance and Description are green on a head up to date with `main`, then confirms the Pages publish.
- The first session this coordinator starts commits this brief as `docs/briefs/coordinator-2026-09-28.md`; if it starts none, the release 34 session does (tell it by `create_trigger`).

## What's left for others

- After today: refactor 7, the terminal-place parts and bringing them together; refactor 10; the systems review's proposals 9, 8 and 2; the rest of the idea board; GitHub's merge queue (the roadmap item the launch-safety session writes); `docs/ROADMAP.md`.
- **The morning summary** (about 09:15 UTC, to the owner in this conversation): what shipped, with PR numbers and the live link `https://kylelookingaround.github.io/final-call/`; a 15-minute checklist for the owner to play on a real phone before posting (fresh save: the first minute and guided start, the top bar, a photo shared, day in a minute, famous faces, the What's new card, Settings › usage counts switch); the decisions taken for them (#105, analytics default on, the freeze, the defaults any session took); #101's seed 1–3 numbers (in its PR description); the watchdog's status; the night's cost (sum `usage.cost_usd` over the sessions in the table plus the coordinators: about $160 by 05:00).

## When to stop and ask

- Only for something irreversible or outside this brief. The owner is awake and reading this conversation's predecessor; they may answer here.
- Otherwise, if it truly needs the owner: open an issue labelled `needs-owner` with the question and the option it will take by default, take the default straight away, and list it in the morning summary. Where it's merely unclear, take the safer option (easier to undo, or changing the game less).

## Cost budget

- Estimate: about $8 for this coordinator (four hours, sweeps with `list_sessions` at `limit: 15`, archive finished sessions as you go so the list stays short).
- At each check-in read `get_session`: `usage.cost_usd`, `context_usage.used_tokens`, `rate_limit_info`. On `allowed_warning` start nothing new. On "rejected" or `isUsingOverage`, `send_later` a minute after `resetsAt` and end the turn.
- Past twice the estimate or about 330k of context, hand over with a brief like this one.
