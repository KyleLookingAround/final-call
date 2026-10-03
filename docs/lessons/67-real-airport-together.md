---
type: Lesson
theme: drawing
---
# Version 31: the real airport brought together · 27 Sep 2026

- **Numbers:** session `session_01TkZWm4yFBrrCU3XqvBNYHK`, estimate $10: cost not yet reported by `get_session` when the PR opened, 74k of 1M context. Started 14:08, a few minutes after weather (#61) merged. Rate limit `allowed` throughout.
- **The owner's change mid-session:** after seeing the roofs, the owner asked for the halls to be clear at every zoom and the roof to be a floor you step up to. This PR made that change (a Roof button on the camera bar, `R.floor`, the `roofs` check, `docs/decisions/ADR-2026-09-27-roof-is-a-floor.md`) and updated the approved terminal spec's floor chip to match, touching `13-camera.js` beyond the brief's list because the owner asked. → The terminal's groundwork builds on `R.floor` and the same control.
- **What it did:** the What's new entry and version 31, screenshots of all nine layouts by day and night at three sizes (and close-ups, a storm and snow), the link preview, the scene's overview in `docs/SYSTEMS.md`, the notes' file table rows, the five parts' look backs below, and `__sim.AF_Y` made live.
- **Speed together:** medians of three `scene` runs, alternating with three on `main` before #50 (d9ba832) on the same machine: Classic desktop 0.452× (0.337× before), Midfield desktop 0.359× (0.324×), Midfield phone 0.345× (0.323×). All under 0.55×. After the roof became a floor (not drawn unless picked), three more branch runs gave 0.365×, 0.376× and 0.373×. Classic's single runs spread 0.33–0.45× on the branch, so one run says little; alternating base and branch runs kept machine drift out of the comparison.
- **Lessons:**
  - One contact sheet per size and zoom (layouts as rows, day and night side by side, drawn in the browser itself since the image has no ImageMagick or PIL) made about 100 screenshots quick to look at; open single shots only where the sheet raises a doubt.
  - Switching layouts again and again in one page crashes in the passengers' walk (`faceW`), because passengers mid-walk keep the old layout's stands. It's a test-script artefact (players rebuild through `rebuildLayout`), but a script that visits every layout should load a fresh page for each.
  - The look backs were gathered by a helper on the cheaper model from `get_session` and the PRs, then checked and trimmed here (experiment [C]); it needed telling to leave model names out of anything bound for the repo.
