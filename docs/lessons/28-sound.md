Theme: checks
# #28 Sound · 27 Sep 2026

- **Numbers:** started 06:11, PR opened 06:33, merged 06:44. No pushes after it opened, and CI was green first time (Checks 6 min, Balance 3.5 min). Its cost is in the whole session's entry above.
- **Went well:** the level-up screen was built while CI ran, on a branch from the unmerged one, then moved onto `main` with `git rebase --onto` once #28 was squash-merged. Nothing was waiting.
- **Lessons:**
  - The bot's `STATE` changed for a change that doesn't touch play, because a release adds setting defaults and bumps What's new's `G.seen`. Proving it meant diffing the saved states by hand. → The bot prints `PLAY`, the fingerprint without `G.set` and `G.seen`; UI-only changes must leave it identical (project notes, `docs/SYSTEMS.md`, `feature` playbook).
  - The spoken-call check first counted calls over a simulated day and failed or passed by luck of the dice: final calls are rare. → Rate limits are checked with a scripted sequence of calls at chosen times, and the day's run only checks the gaps (`tools/checks/sound.mjs`).
