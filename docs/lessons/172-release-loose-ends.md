# Release loose ends · 29 Sep 2026

- **What it did:** a phone camera margin (`camPad`, `measureCam` in `13-camera.js`, with a `camera` check at 320×568, 390×844 and 1440×900) and shorter Crews and Routes › New notes.
- **Snag:** `66-floors.js` (`flyTo`) has its own copy of the `Y1` clamp, a file the brief didn't allow, so a tap on a hall's name can still end short of the margin. It only matters at the very foot; left for a later pass.
- **Cost:** well under the $6 estimate; one CI round.
