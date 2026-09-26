---
name: release
description: Cut a Final Call release - version history entry, save fixtures for the new version, roadmap. Use when the owner asks for a release or release notes after player-visible changes have merged.
---

# Release

`main` publishes to GitHub Pages on every merge, so a release is about the record: what changed for players, and saves that keep old versions tested.

1. **Branch** `feature/release-<version>` from the latest `main`. The version is the next number after the top row of `docs/HISTORY.md`.
2. **History.** Add a row at the top of `docs/HISTORY.md`: a bold headline, then what players will notice, in concise UK English. Leave out code-only changes.
3. **Save fixtures.** If anything added saved fields since the last version:
   - `npm run bot -- 1150 --seed 1` (3-4 minutes).
   - Copy `build/saves/L1.json`, `L3.json`, `L5.json` and `L9.json` to `tools/saves/v<version>-L<n>.json`.
   - `npm run check`: every save, old and new, must load and play. The layout, sheet and screenshot checks use the newest save.
4. **Link preview.** If the game looks noticeably different, `npm run preview`, look at `src/public/preview.jpg`, and commit it.
5. **Roadmap.** Move shipped items to Done in `docs/ROADMAP.md`.
6. **Ship** it as a PR (see the `steward` playbook). After the merge, confirm the "Publish to GitHub Pages" run finished green.
