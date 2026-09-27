# What's new, waiting for a release

A change players will notice adds its What's new entry here as its own file, `src/updates.d/<short-name>.md`, instead of editing `UPDATES` in `src/game/38-updates.js` or `docs/HISTORY.md`. It has no version number: only the release gives one, so two sessions can never both claim the next version.

```
# A short title for the change

- One to three points players will see, in concise UK English.

History: a sentence or two for docs/HISTORY.md, saying what players will notice.
```

The `release` playbook folds every file here into one `UPDATES` entry and one `docs/HISTORY.md` row with the next version, then deletes them. `node tools/join.mjs` lists what's waiting, and the `graph` check fails on a fragment with a version number or no points. The build never reads this folder, so a fragment changes nothing in the game until it's released.
