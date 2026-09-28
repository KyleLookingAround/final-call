Theme: checks
# #156 Systems refactor 7, part 2: arrivals, movement and the index in one pass · 28 Sep 2026

- **Numbers:** session `session_01MCKoS3dpP6BCBYJdBBRqPC`, estimate $20 for both PRs, $5.53 spent when this PR opened, with 24% of its context used. Started 17:53 UTC. #145 merged at 19:21 and this PR opened at 19:50, from the new `main` with no merges needed. Seeds 1–3 of the bot, run locally against a build of `main`, gave identical `STATE` and `PLAY`.
- **Went well:** the second PR was prototyped on a local branch while #145's CI ran, then cherry-picked onto the new `main` once it merged, so waiting on CI cost nothing. The guard from #145 answered the brief's main question in one run: merging the landside pass fails it on the first passenger.
- **Lessons:**
  - The spec's "merge the three passes, in the order they run today" can't hold `PLAY`: the vehicles, weather and events that run between the landside and arrivals passes draw on `rnd()`. Only passes that sit next to each other in `update()` merge exactly. → `docs/systems/terminal.md`, "Passes over passengers". A future change that wants the single pass has to accept a new `PLAY` and go through the Balance baselines.
  - An index gathered at the end of one step and read in the next needs the same rules as a mid-step snapshot: readers check current states, and entries into listed states are added as they happen. Instrumenting every reader against a fresh scan, then removing the instrumentation, took minutes and settled it.
