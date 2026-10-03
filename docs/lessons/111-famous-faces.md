---
type: Lesson
theme: checks
---
# Famous faces (#111) · 28 Sep 2026

- **Numbers:** estimated at $12; about $5 when the PR opened. One build round, one review round, two full local check runs and three bot seeds each way before CI. Merging `main` hit one conflict, in the joined file table of `docs/SYSTEMS.md`. Taking `main`'s side and running `npm run build` fixed it.
- **Adding a saved field breaks every `migrate` hash.** Every save loads the new default, so every save's `G` changes. No field had been added since the hashes were recorded (#86), so nobody had hit this before. → The check now has an `ADDED` list: new fields are left out of the hash and checked to load at their default. The next session that adds a field adds its name there, not new hashes.
- **Timings came from the game, not the code.** At level 5 a flight is at its stand about four hours before it leaves, and most of its passengers are airside within twenty game minutes. A celebrity picked 40–150 minutes out was nearly always through security already, so the crowd never showed. → Pick the flight early (up to 300 minutes out), choose a passenger who hasn't arrived yet, and let the crowd stay a fixed time after they're through. When a feature follows a passenger, print their state for a few game hours before choosing the numbers.
- **Draw where the crowd isn't.** `TERM_DRAW` runs before the passengers, so a crowd drawn inside a busy check-in hall disappears under them. The photographers went outside on the pavement, where only arrivals walk. Look at a level 5 or later screenshot before settling where cosmetic things go.
- **What the review caught:** keeping a stand index from when the flight was picked. A layout change moves flights between stands, which ended the visit with no rating. The runtime state also survived a new game. → Keep the object (`F.i`), not a copy of its place, and tag runtime state with the `R.st` it belongs to.
- **Any new `rnd()` draw moves the recorded checks.** The `daystats` and `weather-fx` groups compare against recordings from `main`. Once #101 was merged in, the visits' draws at the day change shifted both. They were re-recorded on purpose (`DAYSTATS_RECORD=1`, `WEATHER_FX_RECORD=1`), as #101 did. → A feature that adds draws should expect to re-record them in the same PR.
