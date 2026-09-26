# ADR-2026-09-26: Airport layouts are data over one stand model

## Status

Approved

## Context

Version 22 lets players rebuild their airport into different layouts. The game's stand code (planes, seat maps, bridges, gate lounges, shops) was written for eight stands in a row, with planes drawn nose-up and passengers placed relative to that. Rewriting it per layout would multiply the code and the ways it can break.

## Options Considered

### Option 1: One stand model; layouts as data
**Description:** A layout is a table: each stand's position, how far back its plane sits, gate name, price, level, phase and kind (bridge or remote), plus shop units and a few speed-ups. The table is copied into the arrays the game already reads. Buildings particular to a layout are drawn on top.

**Pros:**
- Classic is just one entry, proven to play exactly as before.
- New layouts are mostly data, checked by rules for overlaps and fit.

**Cons:**
- Planes are always nose-up and in one row, so layouts vary position and depth, not angle; radial piers are suggested by the buildings drawn around them.

### Option 2: Free-form geometry per layout
**Description:** Stands at any angle, with passenger paths and seat maps transformed.

**Pros:**
- Truer to real airports' shapes.

**Cons:**
- Touches every coordinate in the stand code; a large rewrite with real risk to the simulation.

## Decision

Layouts are data over the existing stand model: position, depth and kind per stand; planes stay nose-up. Effects come from what the game already simulates (distances, counts, speed-ups, buses, running costs), not flat bonuses.

## Rationale

It gives the variety players see and feel at a fraction of the risk, and keeps the simulation provably intact for Classic.

## Consequences and Trade-offs

**Positive:**
- A new layout is a table entry plus a little drawing, and the `rules` check catches overlaps.

**Negative / Risks:**
- Extra stands add capacity that shortens the game; each layout's prices, levels and limits need balancing with the bot.

**Mitigations:**
- The Balance workflow runs the bot, which rebuilds along a path of layouts, on three seeds; `layouts:false` shows the pacing for players who never rebuild.

## Related

- [ADR-2026-09-26-source-in-numbered-files](ADR-2026-09-26-source-in-numbered-files.md)
- `docs/specs/airport-layouts.md`
