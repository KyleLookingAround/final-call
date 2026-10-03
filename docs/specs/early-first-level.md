---
type: Spec
description: The first level-up comes in the first morning, so newcomers get a real moment early.
status: stable
verified: { by: human:KyleLookingAround, at: "2026-09-28T09:21:11Z" }
---
# The first level-up in the first morning

Issue: #105 · Status: Approved (the owner's decision of 28 Sep 2026 in the brief `docs/briefs/early-first-level.md` stands in for a spec review) · PRs: #117

## What the player gets

A newcomer at 1× reaches Local Airport, the game's first real moment, in about five real minutes (five game hours) rather than 31–41. The level-up card, the first plan points, the region map and gate A3 arrive while the player is still watching their first flights, instead of on the second game day.

## What they see

- On the map, board and gates: nothing new. The first departure still leaves on time for a player who follows the first tip (the `first-level` check keeps that).
- In the panel: Office › Progress lists the level's needs as before; Local Airport now reads 80 passengers flown, a rating of 50 and 1 gate open. The level-up card opens on the first morning, after the guided start has finished (it ends at the first on-time departure), with the same unlocks as before: gate A3, the region and the world map, and the level-1 plans.
- The same on every screen size; no layout changes.

## How it works

- `LEVELS[1].req` in `01-constants.js` changes from `{pax:600, rep:50, gates:2}` to `{pax:80, rep:50, gates:1}`. 80 passengers is two or three R-48 departures; the gate you start with counts. Nothing else changes: the reward (500) and plan points (6), the first schedule, the starting cash, the tips and every later level.
- Why this lever: on `main` the bot flies 600 passengers late on day 2 and only then affords the second gate (400), because it spends its first day's takings on upgrades; a player does the same. Both requirements had to move for a first-morning level, and moving them changes fewer rules than a cheaper gate or more starting cash, which would change the game for everyone.
- Why level 2 stays: it binds on the third gate (3,000), which the player works towards for two days after the second gate; passengers (2,000 in total, 1,500 a day) are met a day earlier. Bringing it forward means dropping that gate or making it cheaper, and either pulls levels 3 and 5 towards the edge of their tolerance (the decision record has the numbers). The ramp is 4–5, 78–84, 99–110, 209–236 game hours on seeds 1–3.
- From the start; no plan unlocks it. Managers and recommendations: none needed.

## Saved state

- No new fields. An old save at Airfield that has already flown 80 passengers levels up within a minute of loading, with the reward and points, as `checkLevel` runs every game minute; that's expected.
- Nothing renamed or removed.

## Balance

- Level 1 moves from 31–41 to 3–6 game hours; the baseline becomes 3–6 (`tools/baseline.json`, the `balance` playbook). The 500 reward and 6 points a day earlier bring level 3 forward by 0–7 hours (99–110, still inside 95–117), levels 5 and 7 by 0–30 hours (311–344 and 620–699, `ok` or `near`) and level 9 by 3–50 hours (1,079–1,143, `near` on two seeds). The owner asked for this change (#105, the brief).

## Checks

- A new group, `first-level`: a fresh airport at 1× with the bot's default play is a Local Airport by game hour 6 on seeds 1–3, with a departure gone on time.
- The `rules` check that each level asks for at least as much as the one before still holds (80 < 2,000 passengers, 1 < 3 gates); the `levelup` check's Local Airport card is unchanged.
- Screenshots: none needed; no layout changes.

## Files

`src/game/01-constants.js` (one line), `tools/baseline.json`, `tools/checks/first-level.mjs` (new), `.claude/skills/balance/SKILL.md`, `docs/systems/levels-and-masterplan.md`, `docs/decisions/ADR-2026-09-28-early-first-level.md`, `docs/briefs/early-first-level.md`, this spec.

## Left out

- The "try 4×" tip (#103's session owns `16-advisor.js`), the first schedule, the starting cash and the price of the second gate.
- Level 2's requirements (see above). If the owner wants the ramp smoother still, a separate balance issue can move level 2 with its own bot runs.
