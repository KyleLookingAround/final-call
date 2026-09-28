Theme: saves
# Release R1: never freeze or lose a save (#158) · 28 Sep 2026

- **Numbers:** estimate $10; the session's cost wasn't reported yet when the PR opened (`get_session` had no usage). Started 20:02 UTC, PR at about 20:45. Two files of game code, one check group, one full `npm run check` (358/358), and no bot runs, since the bot never loads or saves.
- **Went well:**
  - Writing the checks first and running them on a build of `main` showed every row failing, with the numbers the audit gave. It took one stash, a build and one group run.
  - Looking at the warnings as screenshots caught the guided start covering the broken-save warning on a phone. The checks couldn't see it, because `open()` clears the boot's toasts.
- **Lessons:**
  - **A reload saves first.** The repeated-load check passed on `main` at first. Reloading hides the page, and the `visibilitychange` save wrote `savedAt` as now, so the loads after the first paid nothing. → A check that reloads to test time away must block the unloading page's save (as `saves` now does), and should show every new check failing on `main` before trusting a pass.
  - **The audit's row 2 said "revenue".** Following it literally would have paid gross takings where the old bonus paid net. Reading what the old code measured (`G.rate` is net) settled it. Its size (up to three hours away pays about 2.6 game days' profit) is a balance question, left for the owner.
  - **"The bot never loads or saves" was wrong.** It boots the page, and the boot saves, so every run carried the new `G.ver`. `PLAY` hashes all of `G` except a few named fields, so it differed on all three seeds. The Balance jobs only print this PR's hash, so the difference showed up only in a local run against the branch's base. Comparing with the moved `main` first gave a false alarm, so compare with the base commit. → `PLAY` now leaves out `G.ver` (`tools/run-bot.mjs`). A PR that adds a saved field should run the bot against its base before claiming `PLAY` is identical.
