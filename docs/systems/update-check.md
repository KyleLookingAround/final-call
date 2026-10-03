---
type: System
description: Tells players on the published site when a new version is ready.
verified: { by: process:notes-review, at: 2026-09-27T20:02:14Z }
---
# Update check

**Update check** (`37-update-check.js`, spec `docs/specs/update-toast.md`). `tools/build.mjs` stamps a build id into the page (`BUILD_ID`, also a `<meta name="build-id">` tag) and writes it to `dist/version.json`. Only on the published site (`feedbackRepo()`, as the Help feedback link uses), and never in `R.sim`, the game fetches `version.json` every 10 real minutes and on tab visibility (not in the first minute after loading); when the id differs it shows a toast, held back until the guided start and the level-up card are clear. Update now saves and confirms the write before reloading to a cache-busting address; Later snoozes it for an hour (`R.updSnoozeUntil`). Nothing here is saved state.
