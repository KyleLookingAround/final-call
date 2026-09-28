# ADR-2026-09-28: The first level-up comes in the first morning, and level 1's baseline moves with it

## Status

Accepted by the owner on #105 (28 Sep 2026, relayed in the brief `docs/briefs/early-first-level.md`): bring the first real moment forward for newcomers, rather than only nudging them to 4×.

## Context

Local Airport asked for 600 passengers flown, a rating of 50 and two gates open. A new airport has one gate, one 48-seat R-48 and 25 cash: it flies 600 passengers late on its second day, and affords the second gate (400) about then, because the first day's takings go on the upgrades the tips ask for. The bot reached level 1 at game hour 31–41, which is 31–41 real minutes at 1×. A newcomer from a shared link may leave before the first level-up card, the first plan points and the region map (#105; the launch polish audit's row 11).

## Options Considered

### Option 1: Level 1 asks for 80 passengers flown at the gate you start with (chosen)
**Description:** `LEVELS[1].req` becomes `{pax:80, rep:50, gates:1}`. 80 passengers is two or three R-48 departures. The reward (500), the plan points (6), the first schedule, the starting cash, the tips and every later level stay as they were.

**Pros:**
- One line. Level 1 comes at game hour 3.7–4.9 on seeds 1–3 (the first-level check keeps it by hour 6), after the guided start has ended at the first on-time departure.
- Levels 3–9 stay `ok` or `near`: the 500 and the points come a day earlier, which brings level 3 forward by 0–7 hours (still inside 95–117), levels 5 and 7 by 0–30 hours, and level 9 by 3–50 hours.

**Cons:**
- The ramp has a long first step: level 2 stays at 78–84, because it binds on the third gate (3,000), not on passengers.

### Option 2: Also bring level 2 forward by asking for two gates instead of three
**Description:** `LEVELS[2].req.gates` 3 → 2, with option 1.

**Pros:**
- Level 2 at 59–67 on seeds 1–3.

**Cons:**
- Everything after it comes later, not sooner: level 3 at 114–181 (seed 2 `off`), level 4 at 279–309 and level 5 at 390–431 (`off` against 325–360). With two gates a Regional Airport's reward and points go on planes and plans before the third gate, and the airport grows more slowly for it. Rejected.

### Option 3: A cheaper second gate, or more starting cash
**Description:** Keep the old requirement and make the second gate affordable on the first morning.

**Cons:**
- Changes the opening for every player and every seed, and 600 passengers still takes a day and a half on two gates. Rejected.

### Option 4: Leave pacing alone and nudge players to 4× (the issue's default)
**Cons:**
- The first real moment is still 8–10 real minutes away for someone who takes the nudge, and 31–41 for someone who doesn't. The owner chose otherwise. #103 adds the nudge as well.

## Decision

Option 1. The level 1 baseline (`tools/baseline.json`, the `balance` playbook) moves with it; the others stay:

| Level reached | Old range | New range | Bot, seeds 1–3, keeping Classic, before | after |
| --- | --- | --- | --- | --- |
| 1 Local Airport | 31–41 | 3–6 | 32.9–37.6 | 3.7–4.9 |
| 2 Regional Airport | — | — | 80.6–82.6 | 78.4–83.9 |
| 3 City Airport | 95–117 | 95–117 | 105.9–109.5 | 99–109.7 |
| 5 Gateway Airport | 325–360 | 325–360 | 336.2–353.5 | 310.9–343.6 |
| 7 Global Hub | 630–770 | 630–770 | 636.1–666 | 619.7–698.9 |
| 9 Airport of the Year | 1,100–1,160 | 1,100–1,160 | 1,099.9–1,146.9 | 1,079–1,143 |

The "before" column is `main` at #111 (28 Sep 2026, the head this PR was measured against last); the after column is that `main` with this change. Level 9 reads `near` on seeds 1 and 3 (1,079–1,098, against 1,100), which is the earlier reward and points carried through; on `main` at #102 seed 3 didn't reach level 9 inside the run at all, and #111's change to the dice brought it back.

## Consequences

- An old save at Airfield that has already flown 80 passengers becomes a Local Airport within a minute of loading, with the reward and the points. That's expected; no migration.
- The first level-up now lands while the first flights are still on the board, so anything the level-1 card, the region map or the first plan points assume about a second-day airport (cash, a second gate) should assume a first-morning one instead. The 500 reward covers the second gate (400).
- A later change that moves level 2 needs its own bot runs: option 2 shows that a cheaper level 2 can slow everything after it.
- The `first-level` check group plays the bot's first six game hours on seeds 1–3, so a change to the opening (the first schedule, the tips, the R-48) that pushes level 1 past hour 6 fails a check rather than a baseline.
