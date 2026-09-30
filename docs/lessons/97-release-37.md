Theme: release

# Release 37: windows on the apron and decor · 30 Sep 2026

- **Numbers:** one cheaper-model session, estimate about $5. One PR, one full `npm run check` on the release branch after merging `main`.
- **Went well:**
  - **The fragments were already in the right style**, so the fold was a copy, and the History row only needed joining the two.
  - **No new fixtures:** `FIELDS` hasn't changed since the `v36-*` saves, and no field was added, so the existing saves still cover the version.
- **Lessons:**
  - **A release that finishes only part of a roadmap item** (windows and decor are two of the terminal's parts) keeps that item's `docs/roadmap.d/` file at `now` and updates its text instead of moving it to `done`.
