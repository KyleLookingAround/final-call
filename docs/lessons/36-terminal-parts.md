Theme: parts
# The terminal built in parts: #18 halls, #19 hotel, #21 baggage, #22 departures, #23 arrivals, #24 market place, #26 together, #36 briefs · 26–27 Sep 2026

The first split feature: a groundwork PR, then five parts run side by side from briefs, then a finishing session. Every lesson below already changed the `feature`, `steward` or `coordinator` playbook (→).

- **Numbers:**
  - #18 (halls): the coordinating session had cost $134 over 11 hours, against $8–22 for a whole part. Five parts plus the coordinator ran past the five-hour usage limit within the hour.
  - #19 hotel $8.40, 270k of 1M context, opened 21:03, merged 21:14. #21 baggage $21.80, 370k. #22 departures $14.10, 329k. #23 arrivals $11.10, 245k (merged 05:55 the next morning, four pushes by the finishing session). #24 market place $18.30, 383k (CI red twice before opening: `perf` and one market rule).
  - #26 (the finishing session): $14.80, 375k. It merged #24, #23, then itself, with no pushes after opening and CI green first time.
  - #36 (briefs, cost budgets, parts together): $2.60, 153k, seven minutes open. It started with the work staged by the session before it, so the cost is the finishing, not the building.
- **Went well:** #19 changed six files with three one-line hooks and needed nothing at merge. #22 made the game faster (Midfield 0.36× → 0.28×) and warned that little speed headroom was left. #26 found the parts' speed problem had one cause: passengers gained fields in many orders, so the browser saw about 300 object shapes; one shape per passenger halved the time with `STATE` identical on seeds 1–3, and with every part in and search staff paid, every level was within tolerance without tuning.
- **Lessons:**
  - A long conversation re-reads its whole history every turn, so it's the biggest cost. → Keep the coordinator short and start it fresh per feature (`feature` playbook, "Keep the coordinator light").
  - The parts started from the groundwork branch before it was squash-merged, so each looked conflicted everywhere. → Merge the groundwork first; `git merge -s ours` for parts already started (`steward` playbook, "Parts of a split feature").
  - Each part was under the speed budget alone and over it together (#22's warning was right: market place and arrivals took Midfield from 0.36× to about 0.5×, over its 0.375× budget). → Each part gets a share of the `perf` headroom in its brief, and the coordinator measures the parts together before merging the last (`feature` playbook). New passenger fields go in `seatPax`, and fields are never deleted (`docs/systems/terminal.md`).
  - #19 merged its own PR before the coordinator reviewed it, and #26 stopped to ask who merges and which author to use, though the brief had answered both; the questions sat unanswered for about six hours overnight. → Briefs say who merges; sessions don't stop on what the brief or project notes answer (`feature` playbook, "Working while the owner is away").
  - #21 kept running for about 35 minutes after opening its PR, waiting to see it merged; the parts' own check-ins raced the coordinator's and each wake re-read 250–380k tokens. → Parts subscribe to their PR's events, end their turn, and don't book check-ins (`feature` playbook).
  - #21 ran the bot's six runs locally and then the Balance workflow ran them again. → Read the workflow's tables (`balance` playbook).
  - #22 left the search tables' wages and the What's new entry to the coordinator; that's fine, but the list of what's left belongs in the brief.
  - #23's merge had two conflicts, both from parts moving the same drawing loops out of `12-drawing.js`; the brief named the resolution in advance, so it took minutes.
  - #23's baggage check set `R.pax` aside for three minutes, then put the old list back, losing anyone who spawned meanwhile, so their flights never boarded. It passed on `main` only by luck. → The check merges what arrived meanwhile.
  - #24: a rule that depends on another part's timing (departures made everyone airside sooner, so late gate calls no longer meant more shopping) needed a check with both parts in. → The chance of browsing again grows with the time until the gate call. The hotel check counted crew rooms as free, and the courier check measured cost as a change in cash; both were fixed in the checks.
  - #26: the `news` check's fixed waits timed out now and then in full runs (also seen in #18). → It waits for the page's state (`R.newsBoot`).
  - #36: the Parts workflow's first real test waits for the first `part:` PR (its report script had only been dry-run), so the coordinator reads its comment before merging any part. A checked brief written in the same PR let the next session start without a question.
