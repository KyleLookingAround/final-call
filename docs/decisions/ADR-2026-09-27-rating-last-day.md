# ADR-2026-09-27: The rating reflects the last day, and the level baselines move with it

## Status

Accepted by the owner on #96 (27 Sep 2026, relayed by the coordinator): ship it switched on, with new baselines, as long as the extra time is filled with things to do.

## Context

The rating was a running sum of every reward and penalty, clamped at 100. A working airport earns about +3.5 a departure, so from about hour 24 the rating sat at 91–100 on every bot seed (median 100, daily swing 1 point). The rating feeds demand (`attract`), Lowmere's share (`rivShare`) and the levels' requirements, so none of those ever moved, and nothing that cost rating cost anything in practice (#57, idea 1; the polish audit's row 4).

## Options Considered

### Option 1: A rolling 24-hour score per departure, eased into the rating each hour (chosen, tuning B)
**Description:** Each change goes into a rolling score of the last 24 hours. Each hour the rating eases 15% of the way towards `68 + 32 × (net score per departure ÷ 7)`, in its 5–100 clamp.

**Pros:**
- A bad morning of fog and storms shows by lunchtime (5–6 points in the `rating-day` check). Every cause the player can act on now shows, with an arrow on the chip and the causes one tap away.
- Pacing stays within 15% of the old baselines. Level 9 comes 1–4% later, and Lowmere wins more of the routes you share (50–67% at level 8, from 42–48%).
- One sum per hour. No saved field: the score fills again within an hour or two of loading a save.

**Cons:**
- A well-run airport sits at 85–90 and moves a point or two a day, not the 55–90 band the idea hoped for.

### Option 2: The same rule with a wider formula (tuning A, `60 + 40 × net ÷ 7`)
**Pros:**
- The rating sits at 75–89.

**Cons:**
- `attract` pays for every point up to 100, so a rating in the low 80s costs about 10% of demand. Levels 3, 5 and 7 went `off`, and seed 1 took 521 hours to reach level 4.

### Option 3: Keep the running sum
**Pros:**
- Nothing to change.

**Cons:**
- The rating tells the player nothing from day 2.

## Decision

Option 1. The level baselines (`tools/baseline.json`, the `balance` playbook) move with it:

| Level reached | Old range | New range | Bot, seeds 1–3, keeping Classic |
| --- | --- | --- | --- |
| 1 Local Airport | 31–41 | 31–41 | 32.9–37.6 |
| 3 City Airport | 95–117 | 95–117 | 105.8–111 |
| 5 Gateway Airport | 340–370 | 325–360 | 330.5–351.5 |
| 7 Global Hub | 630–770 | 630–770 | 642.8–667.6 |
| 9 Airport of the Year | 1,080–1,115 | 1,100–1,160 | 1,116.5–1,153.9 |

The owner's limit is level 9 no later than about game hour 1,400 keeping Classic. It is at 1,154 at most.

## Consequences

- A change to how departures, queues or the region score the rating now moves the rating by its share of the day, not by its total. The `effects` check adds the causes up against the day's score (`R.rdSum`).
- The wider band (option 2) needs `attract` centred on a rating of about 85 first. That is a separate change, with its own bot runs.
- `window.__rateDay=false` (the bot's `--rate-day=off`) still plays the old running sum, for comparing. It is never saved.
