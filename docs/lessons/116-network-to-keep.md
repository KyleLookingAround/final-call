---
type: Lesson
theme: checks
---
# #116 A network you have to keep · 28 Sep 2026

- **Numbers:** the same session as #101, so the cost is shared: $7.71 when #101 merged, against that brief's $14 estimate. The coordinator's wake-up said the cost was already past the estimate; `get_session` showed it wasn't. Branch started at 04:20 UTC, PR opened at 05:00, inside the owner's 06:30 limit. Three bot runs of 1,350 hours and two full `npm run check`s. The "before" came from #101's runs of the same code, so no runs on `main` were needed.
- **Went well:**
  - The spec was written the evening before, so building it was mostly translation. Its "As built" section records where the build differs (the want is ÷ 400, not ÷ 150; the frequency term is centred; the manager doesn't set Keep by itself).
  - Running the daily step from `rivalDay` rather than a new `DAY` hook kept the recorded clock order, so the `clocks` check didn't need recording again.
  - Measuring the network from the bot's final state (`build/state-<seed>.json`) needed no new bot output.
- **Lessons:**
  - The `sound` check needed a final call in a fixed morning. With planes spread over more routes, flights were emptier, finished boarding early, and no final call came, so the check failed although sound hadn't changed. It now brings one boarding flight's departure forward to be sure of a final call. → A check that needs an event to happen should cause it, not wait for the traffic to make one.
  - Partners, not the bot's planes, did the spreading: the bot buys only widebodies and never uses Keep. Its numbers show what partners do for a player who ignores the feature; teaching the bot Keep would show what a player gains by using it.
