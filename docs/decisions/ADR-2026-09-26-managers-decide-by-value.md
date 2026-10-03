---
type: Decision
description: Managers compare options by the money each is worth in the game's own model, and do the work a little at a time.
status: stable
---
# ADR-2026-09-26: Managers decide by measured value, a little at a time

## Status

Approved

## Context

The transport manager used to retime lines from how full they were: more services above 85% full, fewer below 30% if the line lost money. That misses what matters most. A half-empty airport line can be worth more services because it brings flyers, and a full line may not be worth more. The same kind of rule would mislead any manager added later.

Measuring a change properly means running the region model with and without it. That takes about 2 ms a run on a desktop, and four times as long on a slow phone. A review of every option for every line at once would stall the game.

## Options Considered

### Option 1: Measure each option with the region model, one option per game minute
**Description:**
- `evalRegion` runs the model with the change and without it, at 09:00 and 17:30.
- `recValue` turns the difference into money an hour: transport profit, the airport's extra demand and cheaper wages.
- The manager queues its reviews and makes one measurement per game minute (`mgrStep`), taking the best option if it clears a threshold.
- Every measurement in a run is pinned to the moment the run started (`evalFix`: the same weather and flyers). That way options measured minutes apart still compare fairly, and the line as it runs is measured once, not once per option.
- Suggestions on screen are measured in slices between frames (`recJob`).

**Pros:**
- Decisions follow what the player cares about: money, including the airport's.
- There are no hand-tuned thresholds per lever.
- It runs the same in the headless sim and repeats exactly from a seed, because it's paced by game time.
- The game never stalls.

**Cons:**
- A review takes game time: a level 9 network needs about an hour of game time for all its lines.
- The model's blind spots become the manager's. For example, riders hardly notice line fares, so it picks premium nearly everywhere.

### Option 2: Better thresholds on load and profit
**Description:** Tune the load rules and add rules for fares and meeting flights.

**Pros:**
- Cheap to run.

**Cons:**
- Every new lever needs its own rule, and none of them weigh the airport's gain.

## Decision

Managers choose between options by measuring them with the game's own model and comparing the money each is worth. The work is paced by game minutes, or by slices between frames for the screen, never done all at once in the frame loop.

## Rationale

The model already decides what players earn, so measuring with it keeps the manager honest and its suggestions explainable ("+$480/h, pays back in ~5 days"). Pacing by game time keeps the bot, the checks and players' games identical from a seed.

## Consequences and Trade-offs

**Positive:**
- New levers only need a way to apply them.
- The same values drive the manager, its suggestions and the advisor's tips.

**Negative / Risks:**
- Balance follows the model. When the model rewards something too easily, the manager exploits it.
- Measuring costs CPU in reviews.

**Mitigations:**
- The bot runs with the manager on, so the Balance workflow sees its effect on pacing.
- `airWorth` values the airport by the median recent hour, so a one-off windfall doesn't inflate suggestions.
- The `perf` check includes reviews.

## Related

- `src/game/32-managers.js`, `docs/specs/transport-manager.md`
