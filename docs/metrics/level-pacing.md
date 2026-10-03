---
type: Metric
description: The game hour the bot reaches levels 1, 3, 5, 7 and 9 on seeds 1-3 keeping Classic, judged against the baselines.
tags: [balance, pacing]
sources:
  - { id: baseline, resource: ../../tools/baseline.json, title: The level baselines }
  - { id: rating, resource: ../decisions/ADR-2026-09-27-rating-last-day.md, title: The rating reflects the last day }
  - { id: first-level, resource: ../decisions/ADR-2026-09-28-early-first-level.md, title: The first level-up comes in the first morning }
---
# Level pacing

## Definition

For each of seeds 1, 2 and 3, the game hour at which the bot, playing 1,200 game hours with its default strategy and keeping the Classic layout, first reaches levels 1, 3, 5, 7 and 9. Each level is judged against its range in the baselines:[^baseline] `ok` inside it, `near` within the tolerance (15%) of it, `off` beyond. A level never reached reads `off` once the run has passed the top of its range.

Pacing has one sanctioned computation, [the bot's pacing run](../computations/bot-pacing.md), and one check of its results, its attester. A pacing table in a PR, a lesson or a decision record quotes the attester's `ATTESTED` lines rather than numbers typed from a log.

## Not this

- **Not a rebuilding run.** `'{"layouts":true}'` rebuilds into better layouts and reaches level 9 about 5–10% sooner, so its level 9 row reads `near`. The Balance workflow runs it beside the baseline runs for comparison; it isn't level pacing.
- **Not one seed.** Any change to the code moves the dice, so a change is judged on all three seeds, before and after (the `balance` playbook).
- **Not a run with bot options,** `--rate-day` or `--pol`: they change the strategy or the rules, and the attester refuses them.

## The baselines

The ranges live only in `tools/baseline.json`, which the bot, the Balance and Health workflows and the attester all read; the `balance` playbook shows them as a table with their history. Levels 3–9 were set for the rating that reflects the last day,[^rating] and level 1 for the first level-up in the first morning.[^first-level] They change only for a balance change the owner asked for, in the same PR as that change.

[^baseline]: The level baselines
[^rating]: The rating reflects the last day
[^first-level]: The first level-up comes in the first morning
