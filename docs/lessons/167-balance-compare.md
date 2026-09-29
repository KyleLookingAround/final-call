Theme: balance
# #167 The Balance workflow compares with the merge base, and the bot's `--why` · 29 Sep 2026

- **Numbers:** estimate $6. `get_session` had not reported the cost when this was written. No game code, so no speed budget. One local `--why` run of 48 hours, and the compare step's shell tested against made-up logs.
- **Went well:** the brief carried the owner's default from the issue, so nothing was left to decide.
- **Lessons:**
  - The bot's `why` field is the rating's causes, not the level requirements, so `--why` also reads the game's own `levelChecks` (reachable in the test page because the build exposes every name a tool mentions). → A tool that needs a game function names it as `__sim.<name>` and the build does the rest.
  - The default `pull_request` checkout is the PR merged into a moved `main`, so the compare job checks out the head commit and takes `git merge-base` with the base branch itself.
