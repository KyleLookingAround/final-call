# What's new, waiting for a release

A change players will notice adds its What's new entry here as its own file, `src/updates.d/<short-name>.md`, instead of editing `UPDATES` in `src/game/38-updates.js` or `docs/HISTORY.md`. It has no version number: only the release gives one, so two sessions can never both claim the next version.

```
# A short title for the change

- **A bold lead.** One short sentence players will see. (go: tab:fleet · level: 1)

History: a sentence or two for docs/HISTORY.md, saying what players will notice.
```

The card is scanned, not read, so each point keeps to the style every `UPDATES` entry uses:

- **One to four points**, each a **bold lead** of at most four words ending in a full stop, then **one short sentence** (under 90 characters) in concise UK English.
- **`go:`** (optional) is where its "Show me" button goes: `tab:<tab>`, `<tab>:<sub-tab>` (such as `office:settings` or `sales:landside`), `plan`, `up:<upgrade>`, `gate:<n>`, `pier`, `chal`, `help` or `photo`. `newsOk` in `38-updates.js` lists them. Leave it out for something with no one place to go.
- **`level:`** (optional) is the level the point needs; the card hides it from saves below that level. Leave it out for what everyone has.
- The release copies each point into the entry as `{b, t, go, lv}`. The `news-card` check fails on a lead, sentence, target or level that doesn’t fit, here or in `UPDATES`.

The `release` playbook folds every file here into one `UPDATES` entry and one `docs/HISTORY.md` row with the next version, then deletes them. `node tools/join.mjs` lists what's waiting, and the `graph` check fails on a fragment with a version number or no points. The build never reads this folder, so a fragment changes nothing in the game until it's released.
