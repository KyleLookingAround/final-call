# Release loose ends · 29 Sep 2026

- **What it did:** a phone camera margin (`camPad`, `measureCam` in `13-camera.js`, with a `camera` check at 320×568, 390×844 and 1440×900) and shorter Crews and Routes › New notes.
- **Cost:** well under the $6 estimate; one CI round.
- **Update:** the coordinator handed `66-floors.js` over once the terminal pass merged, so `flyTo` now clamps to `camBounds()` and the `camera` check covers flying to the foot of the map. The snag above is closed.
