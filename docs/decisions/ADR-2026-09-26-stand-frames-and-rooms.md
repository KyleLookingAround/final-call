# ADR-2026-09-26: Stands have their own frames, and airside is rooms joined by doorways

## Status

Approved

## Context

Version 22's layouts were all one straight concourse with planes nose-up above it, so they couldn't look like real airports. The owner asked for real shapes: piers at angles, satellites out on the apron, midfield concourses, a star. The stand code places everything (seats, aisles, bridges, lounges) at the stand's x plus an offset, and passengers walk in straight lines to where they're going.

## Options Considered

### Option 1: A frame per stand, and convex rooms joined by doorways
**Description:** Each stand has a frame that turns plane-local coordinates into the world: a position, a heading, and a kind ('tail' for the old straight-line stands, 'nose' for nose-in ones). Airside is a set of convex rooms joined by doorways. Passengers walk straight inside a room and through the doorways between rooms; the doorways to take are worked out once per layout.

**Pros:**
- The stand code keeps working in its own coordinates; only where things land in the world changes.
- With no rooms and 'tail' frames, every number comes out exactly as before, so the change can be proven not to alter the game (the same end state on seeds 1–3).
- Cheap at run time: a table lookup per walk, no path search per passenger.

**Cons:**
- Rooms must be convex; a curved concourse is several rooms.

### Option 2: A walkable mesh with path search for every walk
**Description:** Airside as a free-form mesh, with each passenger searching for a path.

**Pros:**
- Any shape of building.

**Cons:**
- Slower for thousands of passengers, and much harder to prove unchanged.

### Option 3: Keep one corridor and draw shapes around it
**Description:** What version 22 did.

**Cons:**
- The owner saw through it: the layouts looked flat.

## Decision

Option 1. Stands have frames; airside is convex rooms and doorways. Old layouts keep 'tail' frames and no rooms until they're redrawn. New and redrawn layouts park planes nose-in.

## Rationale

It reaches real shapes while keeping the simulation's code and its proof of correctness intact.

## Consequences and Trade-offs

**Positive:**
- A new shape is data: rooms, doorways, stands with headings, shop units with angles.
- `layoutFaults` checks every 2D layout: planes don't touch each other or buildings, lounges and shops sit in their rooms, doorways join their rooms, rooms are convex and reachable, and gate cards don't cover planes. The `rules` check runs it.

**Negative / Risks:**
- Words on the map must stay upright, so labels are drawn at world positions rather than in a stand's frame.
- While old and new layouts coexist, a rebuild between them moves planes and passengers through both frames.

**Mitigations:**
- Rebuilds happen at 03:00; passengers at gates and shops step to the matching place in the new layout, and planes keep their passengers aboard.

## Related

- Supersedes the "planes are always nose-up" part of [ADR-2026-09-26-layouts-as-data](ADR-2026-09-26-layouts-as-data.md); layouts are still data.
- `docs/specs/airport-shapes.md`
