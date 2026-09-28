Theme: coordinator
# Coordinator playbook · 27 Sep 2026

- **Numbers, this session:** session `session_01AvgXx1pvHYkeuWni23ymZz`, estimate $4: cost and context read 0 while the PR was being built, the usual early reading (`#28` and earlier lessons). One PR, no questions for the owner.
- **Numbers, the retired coordinator:** session `session_01Y9W4q52Eb4JdVy18E9pk5o`: $176 and 642k of 1M context, over 25 hours (26 Sep 10:18 to 27 Sep 11:11).
- **Lessons:**
  - Nothing in the runbook said how a coordinator itself starts, sweeps, talks to an idle session, or hands off to the next one; it only said to keep it light. → A `coordinator` playbook (`.claude/skills/coordinator/SKILL.md`), pointed to from the `feature` playbook's "Keep the coordinator light" and the project notes' playbook list.
  - `ListAgents` and `SendMessage` don't reach an idle cloud session; `create_trigger` with `persistent_session_id` and a near `run_once_at` does. → In the new playbook, so the next coordinator doesn't have to rediscover it.
