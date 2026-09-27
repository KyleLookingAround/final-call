# #101 A rating that reflects the last day, measured; a network you have to keep, specced · 27 Sep 2026

- **Numbers:** estimate $14. `get_session` hadn't reported the cost when this was written. Started 21:04 UTC, PR opened 21:38. There were 23 bot runs of 1,150 hours, four at a time on four cores (about 8 minutes a wave): three for `main` keeping Classic, three for `main` rebuilding, three with the switch off, three on with the first guess, six for two tunings, three for B rebuilding, and one of seed 3 to 1,350 hours. There was one full `npm run check`, with no bots beside it.
- **Went well:**
  - `main`'s runs came from a git worktree of `main` in the scratchpad, with `node_modules` linked, so they ran while the branch was being built and never needed a second build swapped in.
  - Logging the day's net score per departure (`rdS`) in the bot's snapshots made the tuning a calculation rather than a guess. A run with the first guess showed the score sits at 1–3.5 early, about 4 mid-game and 4.5–5 late, whatever the rating does. So the target of any constants could be read off before running them, and the two tunings were enough.
  - Comparing the same seeded day clear and with fog, rather than one day against its own morning, gave the check a signal that doesn't depend on where the rating started.
- **Lessons:**
  - The first check read a loaded save's rating while the rolling score was still filling, so the rating was only drifting down from 100 and the fog didn't show. → A check of anything that averages over a day plays that day first.
  - The rating feeds demand at every point up to 100, so any rule that brings the rating down costs pacing, whatever the rule. Tuning A proved it: rating 82 against 100 cost about 10% of demand and made two seeds `off`. → A change that makes a capped number move needs the number's consumers recentred in the same proposal. The PR recommends that as the next step for the wider band.
  - The PR tool added the session-link footer again; it was taken off by reading the description back.
