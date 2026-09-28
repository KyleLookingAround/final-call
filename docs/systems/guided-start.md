# Guided start

**Guided start** (`36-guided-start.js`). A 6-step tour (`TOUR`) runs on new games only and can be skipped or replayed from Help. It turns itself off on any save with progress.

- The map toolbar's background is `pointer-events:none` (its buttons stay `auto`), so a tap that misses a button falls through to the map instead of doing nothing (issue #103). `tourRect` also keeps a world-based spotlight (`S.w`, used by step 2's "tap gate A1") below the toolbar, so the coach never points at ground the toolbar sits over.
- `tourStep` hides the coach box and the spotlight whenever an overlay (`.help:not([hidden])` — Help, the level-up card, What's New, the Masterplan) is open, the same check `lvlTick` uses, rather than drawing over it.
