---
type: Lesson
theme: coordinator
---
# The coordinator playbook and its later edits: #42 the playbook, #59 limits by plan, #134 no Routines, auto-merge, CI time limit · 27–28 Sep 2026

- **Numbers:** #42 estimate $4, cost and context read 0 while building (the usual early reading), one PR; the retired coordinator had cost $176 and 642k of 1M over 25 hours (26 Sep 10:18 to 27 Sep 11:11). #59 (limits by plan): estimate $3, one PR. #134: about $2.85 against a $4 estimate, about 30 minutes, 162k of context; one commit, opened as a draft straight off `main`. Its Description check failed once, then passed on an edit with no push.
- **Went well:** #134's fresh review (`feature` playbook, step 6) caught two real bugs in the drafted playbook text before they shipped: the retiring step didn't say to delete the new heartbeat trigger, and the heartbeat's `create_trigger` call set `persistent_session_id` to its own id, which targets a different session per the tool's docs (self-bind needs the parameter omitted). Both were caught because the draft described the mechanism in enough detail (which parameter, which mode) for a reviewer to check it against the tool's contract; "book a heartbeat" would have shipped wrong.
- **Lessons:**
  - Nothing said how a coordinator itself starts, sweeps, talks to an idle session or hands off. → The `coordinator` playbook (#42), pointed to from the `feature` playbook and the project notes. `ListAgents` and `SendMessage` don't reach an idle cloud session; `create_trigger` with `persistent_session_id` and a near `run_once_at` does.
  - The session that merged #42 did so before the owner's move to a Max plan and the rule on helper agents reached it; the message arrived after its PR had merged and closed, so it never acted on it. → A coordinator checks for a message it hasn't acted on before treating a merge as the end of the work.
  - A PR description that names editor-settings paths (`.claude/…`) with the literal word inside them fails the Description check the way a commit message would; the project notes' "editor settings" rule was for commits and didn't carry over. → In the `steward` playbook: no such paths in PR prose.
