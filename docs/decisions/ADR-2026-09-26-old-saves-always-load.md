---
type: Decision
description: "Every older save keeps loading: new state gets a default, saved fields are never renamed or removed, and real saves are checked."
status: stable
---
# ADR-2026-09-26: Every older save keeps loading, forever

## Status

Approved

## Context

Players keep one airport for weeks. The save is the whole state `G`, stored as JSON in `localStorage['final-call-save-v2']` and, in the artifact copy, in the player's account. A save that fails to load loses a player's progress, and saves from version 14 onwards are still in use.

## Options Considered

### Option 1: Migrate every older save on load
**Description:** New fields get defaults in `DEFAULT()`; `resetAll(state)` fills in and converts anything an older save lacks. Saved fields are never renamed or removed.

**Pros:**
- No player ever loses an airport.
- One migration path, tested on real saves.

**Cons:**
- `resetAll` grows with every change to saved state.
- Old field names stay even when a better name exists.

### Option 2: Versioned save format with breaking resets
**Description:** Bump a version and start old saves afresh (or offer a limited conversion).

**Pros:**
- Freedom to reshape saved state.

**Cons:**
- Players lose progress; trust in the game suffers.

## Decision

Every older save must keep loading. Give new state a default in `DEFAULT()` and handle its absence in `resetAll`; never rename or remove saved fields. `tools/saves/` keeps real saves from each version that changed saved state, and the checks load and play every one of them.

## Rationale

A player's airport is the game's most valuable asset, so losing one is worse than any cost in code. Testing against real saves is the only reliable way to keep the promise as the game grows.

## Consequences and Trade-offs

**Positive:**
- Updates never cost players progress.
- The checks catch a broken migration before it ships.

**Negative / Risks:**
- Saved state carries legacy fields and migration code indefinitely.
- A migration can be subtly wrong without crashing.

**Mitigations:**
- The `rules` check confirms that loading a save twice changes nothing.
- Each release that adds saved fields adds saves made with it (`v<version>-L<level>.json`).

## Related

- `resetAll` in `src/game/22-save.js`
- `tools/saves/` and the `saves` group in `tools/check.mjs`
