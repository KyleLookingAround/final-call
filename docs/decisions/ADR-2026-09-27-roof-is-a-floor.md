---
type: Decision
description: The roof is a floor the player picks with the Roof button, not something zoom fades in and out.
status: stable
---
# ADR-2026-09-27: The roof is a floor the player picks, not a zoom

## Status

Accepted (version 31). Replaces the roofs' zoom fade in `docs/specs/real-airport.md` and #51's move of it.

## Context

The roofs part (#52) drew solid roofs zoomed out and faded them away as the camera zoomed in; #51 moved the fade so the 1× starting zoom was clear. The owner then said: "the roof should be clear. I don't want to zoom in to have to see the customers. I should be able to go up and down layers to see floors/roof as a floor." The approved terminal spec (`docs/specs/terminal-place.md`) had also tied its two floors to zooming in.

## Options Considered

### Option 1: Keep the fade, push it further out
**Pros:** no new control. **Cons:** zoomed out still hides the passengers, which is what the owner doesn't want.

### Option 2: The roof is a floor, picked on the map
**Pros:** the halls are always visible at any zoom; one control grows into Roof / Departures / Arrivals when the terminal gets two floors. **Cons:** one more button on the camera bar.

## Decision

Option 2. `R.floor` (runtime, not saved) picks the floor drawn, starting on the halls. The **Roof** button, first on the airport view's camera bar, steps up to the roof and back down. Zoom never changes the floor.

## Consequences

- Nothing may hide the halls or the passengers because of the zoom alone.
- The terminal's two floors extend the same control and `R.floor` (`'halls'` becomes `'up'` and `'down'`); their spec is updated to match.
- The `roofs` check proves the halls are clear at every zoom and the button goes up and down.
