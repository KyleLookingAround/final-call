---
name: release
description: Cut a Final Call release - claim the version, fold the What's new fragments into UPDATES and the version history, save fixtures for the new version, roadmap. Use when the owner asks for a release or release notes after player-visible changes have merged.
---

# Release

`main` publishes to GitHub Pages on every merge, so a release is about the record: what changed for players, and saves that keep old versions tested. Features never pick a version number: each leaves a fragment in `src/updates.d/`, and only a release numbers and folds them, so two sessions can never both claim the next version.

1. **Claim the version.** It's the next number after the top row of `docs/HISTORY.md`. `git fetch origin main`, check no other `feature/release-*` branch is open (`git ls-remote origin 'refs/heads/feature/release-*'`), then claim it by creating the branch on GitHub before any work, with the GitHub tools' `create_branch` (or `POST /repos/{owner}/{repo}/git/refs`) from `main`: GitHub refuses it if the branch already exists. A `git push` can't claim it: it succeeds quietly when the branch already sits at the same commit. If the create is refused, another session has claimed that version: stop and say so. Then `git fetch origin && git checkout -b feature/release-<version> origin/feature/release-<version>`.
2. **Fold the fragments.** `node tools/join.mjs` lists what's waiting in `src/updates.d/`. From them write:
   - one `UPDATES` entry at the top of `src/game/38-updates.js`: the version, a short title and two to four points players will see;
   - one row at the top of `docs/HISTORY.md`: a bold headline, then what players will notice, in concise UK English, from the fragments' History lines. Leave out code-only changes.
   Then delete the folded fragments (keep the folder's README). The `rules` check fails if the two versions disagree.
3. **Save fixtures.** If anything added saved fields since the last version:
   - `npm run bot -- 1200 --seed 1` (3-4 minutes).
   - Copy `build/saves/L1.json`, `L3.json`, `L5.json` and `L9.json` to `tools/saves/v<version>-L<n>.json`.
   - `npm run check -- migrate` fails for the new files and prints their hashes: add those lines to `GOLD` in `tools/checks/migrate.mjs`. Never change an existing line there; if an old save's hash changed, what it loads to changed.
   - `npm run check`: every save, old and new, must load and play. The layout, sheet and screenshot checks use the newest save.
4. **Link preview.** If the game looks noticeably different, `npm run preview`, look at `src/public/preview.jpg`, and commit it.
5. **Roadmap.** Add `docs/roadmap.d/<date>-release-<version>.md` with `Section: done` and a line for the version, and change the shipped items' own files from `Section: now` to `Section: done`. `npm run build` rejoins the roadmap.
6. **Ship** it as a PR (see the `steward` playbook): write the look back into the PR, mark it ready, turn on auto-merge with the squash method, book one `send_later` to confirm the merge, then confirm the "Publish to GitHub Pages" run finished green.

## Launch week

For a launch week (players are being pointed at the game for the first time), release more carefully than usual:

- **One release a day at most**, hotfixes excepted. The update toast comes back hourly on "Later", so five versions in a day nags the players a launch is trying to keep.
- **No new systems for 48 hours after the launch post.** Sessions spend that window fixing what players report (bugs, balance) and polishing, not building.
