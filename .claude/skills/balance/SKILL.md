---
name: balance
description: Measure and tune Final Call's economy and pacing with the bot on seeds 1-3, before and after a change, against tools/baseline.json. Use for any change to costs, income, demand, fares, levels or Lowmere.
---

# Balance

The bot plays 1,200 game hours and records the hour it reaches each level. The same seed and code always give the same run, but any change to the code shifts the dice, so judge a change on several seeds, before and after.

## 1. Before

On the branch's starting point (usually `main`), run three seeds side by side. Each takes 3-4 minutes.

```
npm run build
for s in 1 2 3; do nohup node tools/run-bot.mjs 1200 --seed $s > build/before-$s.log 2>&1 & done
```

Keep the `LVLAT` line and the table at the end of each log.

For a change meant to leave play as it is (a refactor, a UI change), "identical" means against the PR's merge base, not a `main` that has moved on. Label the PR `refactor` (or `balance`) and the Balance workflow's `compare` job builds both, runs seeds 1–3 keeping Classic, and prints in its summary whether `PLAY` and `STATE` match, seed by seed; read that rather than repeating the runs. A PR that adds a saved field expects `PLAY` to match and `STATE` to differ only by that field (`PLAY` leaves out the settings and a few one-off flags: `G.ver`, `G.set`, `G.seen`, `G.tip4x`).

**Locally, while tuning** (the label runs it once per label): make a `git worktree` of the merge base (`git merge-base HEAD origin/main`) in the scratchpad with `node_modules` symlinked in, build it, and run the seeds on both sides at once (twelve runs on four cores take about ten minutes; keep other loads off the machine).

Before touching baselines for a pacing question, trace the bot: its snapshots carry cash, rating, the day's passengers, gates, supply against the market and a `why` field. `node tools/run-bot.mjs 1200 --why` prints, per snapshot, which level requirement holds the next level back and the rating's causes, so read that before any tuning (or run `tools/bot.js` with `every:1` for hour by hour). Baseline runs go last, once, against the head that will merge.

## 2. Change, then after

Make the change, rebuild, and run the same three seeds into `build/after-$s.log`.

## 3. Compare

- Put before and after side by side per level: each seed, and the mean. A level the run never reached reads `off` once the run passes its upper bound (the 1,200-hour run passes level 9's 1,110); "not run long enough" means a shorter run.
- Against `tools/baseline.json`: `ok` is inside the range, `near` is within 15% of it, `off` is beyond. Aim for `ok`; `near` needs a reason; `off` needs the owner's agreement.
- `ERR` must be empty on every seed.
- Report the table in the PR description.

## 4. When the owner wants the pacing to change

- Agree the target in the issue first ("City Airport by about hour 90").
- Update `tools/baseline.json` and the table under "Baselines" below in the same PR as the change.

## Tips

- On a PR labelled `refactor` or `balance` the Balance workflow also compares `PLAY` and `STATE` with the merge base (section 1). On a PR the Balance workflow runs the same seeds both ways, once when the PR opens or leaves draft, and again when the `balance` label is added. Run them locally while tuning; otherwise report the workflow's tables, so the same runs aren't made twice, and add the label to rerun it on the final code.
- Speed (`perf`, `scene`): one run varies by about ±0.05×, more than most changes, and the calibration ratio drifts with machine load. Take the median of three runs alternating with `main` on the same quiet machine, time a layer on and off in one page for its own share, and profile the functions a hot-loop change touches (`Profiler` over CDP). Compare per passenger when the change alters play. Numbers from different machines don't compare (lessons #49, #108, #113, #145, #162).
- One part of a feature built in parts reports its numbers and tunes only outside 15% of the baselines. The whole feature is rebalanced once, with every part in.

- `build/saves/L<n>.json` are the bot's airports at each level; seed one through `localStorage['final-call-save-v2']` to look at a stage.
- Bot options (JSON after the hours) change its strategy; they are read as `opts.*` in `tools/bot.js`. For example `'{"noBuyLow":true}'` never buys Lowmere, and `'{"layouts":true}'` rebuilds into better layouts (`layoutPath` picks which).
- `--pol='{"late":"close"}'` plays with Office › Policies set (any `POLDEF` key, `01-constants.js`); those runs add `-pol` to the file names and don't write `build/saves/`.
- **The bot's fare is set in the first morning.** It raises the fare 10% every two hours while the rating is under 70, but no further than the advisor's tips go (`FARE_TIP`, so 120% at most), and lowers it only at 92. A new airport starts at 60, so the first morning's punctuality decides whether it settles at 110% or 120%. Before #147 there was no cap, and a slow first morning left seed 1 at 240% and at City Airport for good. Read the `fare` in the snapshots when one seed lags.
- `--rate-day=off` plays the old running-sum rating, for comparing against the rating that reflects the last day (`docs/systems/effects.md`), and `--rate-day='{"scale":6}'` tries other constants. Those runs don't write `build/saves/`, and they add `-sumrating` or `-rateday` to the bot's file names. The snapshots carry `rdT` (the rating's target) and `rdS` (the day's net score per departure).
- The Balance workflow runs the three seeds on PRs that touch `src/game/` or the bot, once keeping Classic and once rebuilding: when the PR opens or leaves draft, when the `balance` label is added, and on demand. Its tables are in the run's summary; `off` levels show as warnings. The baselines are for keeping Classic; rebuilding should reach level 9 about 5–10% sooner, so its level 9 row reads `near`.

## Baselines (bot, 1200 game hours)

`tools/baseline.json` holds these ranges; the bot and the Balance workflow read them from there. Change both together, and only for a balance change the owner asked for.

| Level reached | Game hour |
| --- | --- |
| 1 Local Airport | 3–6 |
| 3 City Airport | 85–105 |
| 5 Gateway Airport | 275–325 |
| 7 Global Hub | 580–700 |
| 9 Airport of the Year | 1,050–1,110 |

With these baselines there are no errors. Level 1 was set for the first level-up in the first morning (`docs/decisions/ADR-2026-09-28-early-first-level.md`; before it, level 1 was 31–41). Levels 3–9 were set for the rating that reflects the last day (`docs/decisions/ADR-2026-09-27-rating-last-day.md`; before it, level 5 was 340–370 and level 9 1,080–1,115). Levels 3–9 were set again in #147 (release batch B1), for its level changes and for the bot's fares capped at 120% like the advisor's tips (before it, level 3 was 95–117, level 5 325–360, level 7 630–770 and level 9 1,100–1,160). Keeping Classic, seeds 1–3 then reach level 1 at 3.8–4.4, level 2 at 58–62, level 3 at 87–92, level 5 at 280–307, level 7 at 589–599 and level 9 at 1,061–1,081, all at a fare of 120%. They are for an airport that keeps Classic; rebuilding reaches level 9 about 5–10% sooner (967–1,020 on seeds 1–3 before #147). If the bot ignores Lowmere, its share settles at about 50–60%. Keep pacing within about 15% of these numbers unless the owner asks for a change.
