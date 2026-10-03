---
type: Spec
description: A What's new card that shows each version's changes once, and on demand.
status: stable
verified: { by: human:KyleLookingAround, at: "2026-09-28T12:21:06Z" }
---
# What's new

Issue: #8, #128 · Status: Built (#8); Approved (#128, by the owner on 28 Sep) · PRs: #9, #129

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

## Easier to read and act on (#128)

A card that scans in seconds and takes the player to what changed. Release 35 is the biggest card yet, so this lands first.

### What they see

- **Shorter points.** Each point is a **bold lead** of two to four words and one short sentence ("**A Fleet tab.** Your planes, crews and servicing, beside Gates."). Every existing entry is rewritten this way; titles and version numbers stay.
- **Show me.** A point that names a place has a small "Show me ›" button at its end. It closes the card (the speed comes back, as with Play) and goes there, the way the level-up card's links do: a tab, an Office or Sales sub-tab, the Masterplan, an upgrade, a gate, Pier B, the weekly challenges, How to play or photo mode. Points with no place, or whose tab the save hasn't opened yet, show no button.
- **Locked points hidden, and revealable.** A point can carry the level it needs (Famous faces at 3, the Round terminal at 6, Midfield concourses at 9). The card leaves out points above the save's level, never greyed out. A version with any hidden points ends with one quiet "N more for later levels · Show" control; tapping it reveals them in place, each marked with its level ("Level 6") and without a "Show me" button. A version whose points are all hidden shows its title with that control. The reveal lasts for that viewing only and isn't saved (the owner's change of 28 Sep). Grown saves see everything as before.
- **Phone fit.** The card becomes a header, a scrolling list and a footer that always holds Play (like the level-up card), so Play is never scrolled out of reach. Points are tighter on phones. At 320×568 and 568×320 the newest entry's title and first points show with Play in view. Tablets and desktops keep a centred card, no taller than the screen.
- The Ko-fi link stays at the foot of the list, below the versions.

### How it works

- A point in `UPDATES` is either the old plain string (still shown as before) or `{b, t, go, lv}`: the bold lead, the sentence, an optional target and an optional level.
- Targets reuse the level-up card's grammar (`plan`, `tab:<tab>`, `up:<key>`, `gate:<i>`, `pier`, `chal`) plus `<tab>:<sub-tab>` (for example `office:settings`, `sales:landside`), `help` and `photo`. One function in `38-updates.js` checks a target and one goes there.
- Fragments in `src/updates.d/` use the same shape in Markdown: `- **Lead.** Sentence. (go: tab:fleet, level: 1)`, the brackets optional. The README sets the style and the release copies it into the entry.

### Saved state

None beyond `G.seen`. Old entries and old saves keep working.

### Balance

None: presentation only. `PLAY` and `STATE` stay identical on seeds 1–3.

### Checks

- **New `news-card` group:** every point's target is valid and every level is a real level (0–9); every point has a lead and a short sentence; a level 1 save hides points above level 1, with one Show control per version that has them, and a level 9 save shows them all; a real tap on Show reveals that version's points marked with their level, and the next viewing hides them again; a real tap on each "Show me" button at level 9 lands on its target (tab, sub-tab, Masterplan, help or photo mode) and closes the card; at 320×568 and 568×320 the newest version's title and Play are both on screen without scrolling.
- **`noise`** and **`kofi`** keep their checks as the markup moves.

### Files

`src/game/38-updates.js` (the entries, `newsOk`, `newsCan`, `newsGo`, the card), the card's CSS and markup in `src/shell.html`, `src/updates.d/` (its README and the waiting fragments, reworded), `tools/checks/news-card.mjs`, and the notes.

### Left out

- A picture per version (issue #128's idea 4): a later step, once the card's shape has settled.
- No saved choice to always show later points: the reveal is per viewing.

## Left out (#8)

- No notifications outside the game, and no tracking of who read what.
- No images in the card for now; the headline and lines are enough.
