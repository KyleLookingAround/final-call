---
type: System
description: The six-step tour for new games, which can be skipped or replayed from Help.
verified: { by: process:notes-review, at: 2026-09-29T00:51:14Z }
---
# Guided start

**Guided start** (`36-guided-start.js`). A 6-step tour (`TOUR`) runs on new games only and can be skipped or replayed from Help. It turns itself off on any save with progress.

- The map toolbar's background is `pointer-events:none` (its buttons stay `auto`), so a tap that misses a button falls through to the map instead of doing nothing (issue #103). `tourRect` also keeps a world-based spotlight (`S.w`, used by step 2's "tap gate A1") below the toolbar, so the coach never points at ground the toolbar sits over.
- `tourStep` hides the coach box and the spotlight whenever an overlay (`.help:not([hidden])` — Help, the level-up card, What's New, the Masterplan) is open, the same check `lvlTick` uses, rather than drawing over it.
- For a selector-based step (`S.q`), `tourRect` scrolls the target into view (`scrollIntoView({block:'center'})`) when its rect is off-screen before spotlighting it, so a target lower in a scrollable panel than the viewport (step 4's desk button on a short phone) is never spotlit off-screen.
- A step can carry both `ok` (auto-advance once it's true) and `next` (a Next/Done button, for a player who'd rather move on): step 3 accepts 2× or more, not only 4×, since the folded speed button's first tap gives 2×; step 5 (get a flight away on time) also takes a manual Next, since a punctual departure can be minutes away.
- Level-ups reached during the tour don't fall back to the toast: `lvlUp` (`49-levelup.js`) still queues `R.lvlCard`, and `lvlTick` only holds off opening it while `G.tour` isn't `done`. `tourNext`, on the step that ends or skips the tour, calls `lvlTick` itself, so a newcomer's first level-up (level 1 usually lands mid-tour) opens the card right away rather than on the next UI tick.
