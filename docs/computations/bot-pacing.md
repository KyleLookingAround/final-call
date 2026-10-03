---
type: Attested Computation
description: The bot's 1,200-hour run on one seed, keeping Classic, whose receipt says when it reached each level against the baselines.
tags: [balance, pacing]
runtime: node
parameters:
  - { name: seed, type: integer, required: true }
  - { name: hours, type: integer, required: true }
executor:
  resource: ../../tools/run-bot.mjs
  receipt: [seed, hours, lvlAt, rows, errs, build, baseline, opts, rateDay, pols, commit]
attester:
  resource: ../../tools/attest-pacing.mjs
sources:
  - { id: baseline, resource: ../../tools/baseline.json, title: The level baselines }
  - { id: balance, resource: ../../.claude/skills/balance/SKILL.md, title: The balance playbook }
---
# The bot's pacing run

The sanctioned way to measure [level pacing](../metrics/level-pacing.md). A session supplies only the seed and the hours (at least the baselines' 1,200);[^baseline] it doesn't change the command, the bot or its options.

# Computation

```
npm run build
node tools/run-bot.mjs <hours> --seed <seed>
```

`--why` may be added: it prints more but doesn't change the run. Nothing else: no bot options after the hours, no `--rate-day` and no `--pol`. Those are for tuning and comparing (the `balance` playbook),[^balance] not for pacing.

## The receipt

The run writes `build/bot-<seed>.json`:

| Field | What it is |
| --- | --- |
| `seed`, `hours` | The parameters it ran with |
| `lvlAt` | The game hour it first reached each level |
| `rows` | The table it printed: each baseline level's hour and `ok`, `near` or `off` |
| `errs` | Errors the game threw (the run stops at the first) |
| `build` | A hash of the `build/test.html` it played |
| `baseline` | A hash of the `tools/baseline.json` it was judged on |
| `opts`, `rateDay`, `pols` | Bot options, `--rate-day` and `--pol`: empty or null for this computation |
| `commit` | The commit it ran on, for the reader (the build's hash is what's checked) |

It also holds `state` and `play`, the fingerprints the Balance workflow compares; they aren't part of pacing.

## Attesting

```
node tools/attest-pacing.mjs 1 2 3
```

For each seed it prints `ATTESTED` with the table, or `REFUSED` with why, and exits 1 if any is refused. It refuses a receipt from a run with options, a run shorter than the baselines' hours, a run of another build than the `build/test.html` here, one judged on another `tools/baseline.json`, one with errors, and one whose table doesn't match the table its level hours give when worked out again. So rebuild before attesting a receipt from another checkout, and run the bot again after changing the game.

The Balance workflow attests each keep-Classic run on a PR and puts the line in its summary. Quote those lines in the PR.

[^baseline]: The level baselines
[^balance]: The balance playbook
