---
name: balance
description: Measure and tune Final Call's economy and pacing with the bot on seeds 1-3, before and after a change, against tools/baseline.json. Use for any change to costs, income, demand, fares, levels or Lowmere.
---

# Balance

The bot plays 1,150 game hours and records the hour it reaches each level. The same seed and code always give the same run, but any change to the code shifts the dice, so judge a change on several seeds, before and after.

## 1. Before

On the branch's starting point (usually `main`), run three seeds side by side. Each takes 3-4 minutes.

```
npm run build
for s in 1 2 3; do nohup node tools/run-bot.mjs 1150 --seed $s > build/before-$s.log 2>&1 & done
```

Keep the `LVLAT` line and the table at the end of each log.

## 2. Change, then after

Make the change, rebuild, and run the same three seeds into `build/after-$s.log`.

## 3. Compare

- Put before and after side by side per level: each seed, and the mean.
- Against `tools/baseline.json`: `ok` is inside the range, `near` is within 15% of it, `off` is beyond. Aim for `ok`; `near` needs a reason; `off` needs the owner's agreement.
- `ERR` must be empty on every seed.
- Report the table in the PR description.

## 4. When the owner wants the pacing to change

- Agree the target in the issue first ("City Airport by about hour 90").
- Update `tools/baseline.json` and the table under "Baselines" below in the same PR as the change.

## Tips

- On a PR the Balance workflow runs the same seeds both ways, once when the PR opens or leaves draft, and again when the `balance` label is added. Run them locally while tuning; otherwise report the workflow's tables, so the same runs aren't made twice, and add the label to rerun it on the final code.
- One part of a feature built in parts reports its numbers and tunes only outside 15% of the baselines. The whole feature is rebalanced once, with every part in.

- `build/saves/L<n>.json` are the bot's airports at each level; seed one through `localStorage['final-call-save-v2']` to look at a stage.
- Bot options (JSON after the hours) change its strategy; they are read as `opts.*` in `tools/bot.js`. For example `'{"noBuyLow":true}'` never buys Lowmere, and `'{"layouts":true}'` rebuilds into better layouts (`layoutPath` picks which).
- The Balance workflow runs the three seeds on PRs that touch `src/game/` or the bot, once keeping Classic and once rebuilding: when the PR opens or leaves draft, when the `balance` label is added, and on demand. Its tables are in the run's summary; `off` levels show as warnings. The baselines are for keeping Classic; rebuilding should reach level 9 about 5–10% sooner, so its level 9 row reads `near`.

## Baselines (bot, 1150 game hours)

`tools/baseline.json` holds these ranges; the bot and the Balance workflow read them from there. Change both together, and only for a balance change the owner asked for.

| Level reached | Game hour |
| --- | --- |
| 1 Local Airport | 31–41 |
| 3 City Airport | 95–117 |
| 5 Gateway Airport | 340–370 |
| 7 Global Hub | 630–770 |
| 9 Airport of the Year | 1,080–1,115 |

With these baselines there are no errors. They are for an airport that keeps Classic; rebuilding well should reach level 9 about 10% sooner (975–989 on seeds 1–3, measured on `main` 27 Sep 2026: 989.1, 988.9 and 974.6 — see `docs/lessons/89-pax-movement.md`). Since version 27's transport manager, keeping Classic reaches level 9 at 1,051–1,068 and level 5 at 301–322, a little before those ranges and within the tolerance. If the bot ignores Lowmere, its share settles at about 50–60%. Keep pacing within about 15% of these numbers unless the owner asks for a change.
