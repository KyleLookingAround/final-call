# What's new

Issue: #8 · Status: Built

Part of the same release as airport layouts (version 22).

## What the player gets

When a player opens the game after an update, a **What's new** card shows what has changed since their last visit. They read it, close it and carry on. The card always holds the full history of the game's features, newest first, and can be opened any time from Settings or Help.

## What they see

- **The card:** a dialog in the same style as Help.
  - Titled "What's new".
  - Each update has a short headline and two to four lines.
  - It lists every version, back to the first. The ones the player hasn't seen are open; older ones are folded and open with a tap.
  - A **Play** button at the bottom closes it.
  - The game pauses while it's open, as it does for Help.
- **When it opens:** on load, only if there's an update the player hasn't seen. It doesn't open for brand-new players, who get the guided start instead, or while the guided start is running.
- **In Settings and Help:** a "What's new" button in Office › Settings and a link in Help open the card any time, with the full history.
- **On phones:** a full-height card that scrolls. It works at 320 px and leaves room for the phone camera.
- **Old-style messages:** future updates use this card instead of the one-off "New: …" messages at boot. The existing messages stay for the old saves that need them.

## How it works

- **The list of updates** lives in the game, in `src/game/`, as `UPDATES`: a list of `{v, title, points}`, newest first. It's written for players in concise UK English.
  - It holds the full history: a summary of the early versions (up to 15), then versions 16–21 shortened from `docs/HISTORY.md`, then version 22 for this release (airport layouts and smoother fast speed).
- **Closing the card** records that the player has seen everything up to the newest version.
- **Releases:** each release adds an entry. The release playbook covers it, and a check makes sure the newest entry matches the top version in `docs/HISTORY.md`, so the two can't drift apart.

## Saved state

- **New field:** `G.seen`, the newest version the player has seen.
  - `DEFAULT()` sets it to the newest version, so new games don't see the card.
  - `resetAll` sets it to 21 when it's missing, so every existing airport sees version 22's notes once.
- **Nothing is renamed or removed.**

## Balance

None; this is presentation only.

## Checks

- **`rules`:** the newest `UPDATES` entry matches the top version in `docs/HISTORY.md`, and versions are in order and unique.
- **New `news` group:**
  - an older save opens the card on load, and after closing and reloading it doesn't open again;
  - a new game doesn't open it;
  - Settings and Help open it, showing every version.
- **`layout`:** the card open, from 320 px to 2560 px, portrait and landscape.
- **`shots`:** a screenshot of the card on phone and desktop.

## Files

- **New:** `src/game/38-updates.js` for the list, the card, and opening it on load and from Help.
- **Changed:**
  - `src/shell.html`, for the dialog and its styles;
  - `22-save.js` and `23-boot.js`;
  - the checks, the release playbook, and the project notes.

## Left out

- No notifications outside the game, and no tracking of who read what.
- No images in the card for now; the headline and lines are enough.
