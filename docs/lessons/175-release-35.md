Theme: releases
# #175 Release 35, the public release · 29 Sep 2026

- **Numbers:** started 07:40 UTC on 29 Sep, ready to open by about 08:00; the brief's estimate was about $10 and `get_session` showed no cost figure (a 0 or absent one means not yet known). One bot run (seed 1, 1200) for the fixtures, one preview, one full check.
- **Went well:** the fold was mechanical because every fragment already had a lead, a sentence and a History line; the `news-card` and `rules` checks caught nothing to fix.
- **Lessons:**
  - The bot's saves carry the sim clock's `savedAt`, not a date in the past, so the backdating step needs a fixed old value: the v32 fixtures use 1700000000000, and so do these. The hash zeroes `savedAt`, so the value never changes a `GOLD` line.
  - The link preview shows the departures floor only; the camera-bar floor switch isn't in the image, so "make sure the new floors show" can't be met without changing `tools/preview-image.mjs`, which the brief keeps out of scope. Left as it is.
  - The two-floors roadmap item also holds the roof terrace and the other layouts' floors, so it stays in Now with the shipped part named; only the release audit item moved to Done.
  - Two checks assumed fragments are always waiting: `news-card` required at least one, and a spec linked a fragment file. Both fail the moment a release folds them, and only the full check shows it. → `news-card` no longer needs a waiting fragment; specs shouldn't link a fragment.
