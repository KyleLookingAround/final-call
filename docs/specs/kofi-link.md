---
type: Spec
description: A quiet Ko-fi link at the foot of Settings.
status: stable
verified: { by: human:KyleLookingAround, at: 2026-09-27T14:37:53Z }
---
# A Ko-fi link

Issue: none · Status: Approved (the owner asked for this on 27 Sep 2026; approved in advance by the brief of that date, `docs/briefs/kofi-link.md`) · PRs: (added as it opens)

## What the player gets

A quiet way to support the game, for anyone who wants to: a small "Buy me a Ko-fi" link that opens the owner's Ko-fi page. It never gets between the player and the game.

## What they see

- A small, quiet button reading "Buy me a Ko-fi" with a cup icon (the existing `cup` icon, drawn inline). It opens `https://ko-fi.com/kylemck` in a new tab.
- **What's new:** at the foot of the card, below the Play button.
- **Office › Settings:** at the foot of the page, under "Your save" (below Reset progress).
- **The level-up card:** one line at the foot of the scrolling list, under every link to what's just unlocked, never above them. It sits inside the scrolling body, not the fixed Masterplan/Play footer, so it changes nothing about the card's pausing, its speed restore or how it closes.
- Never on the airport view, the board, the goal bar, in toasts, or in the guided start.
- Fits a 320 px phone, a landscape phone, a tablet and a large screen, in the game's own dark look.

## How it works

- A plain `<a>` element with `target="_blank" rel="noopener"`. No Ko-fi widget, script, external image or font, and no tracking: the page stays one file with no dependencies (`docs/decisions/ADR-2026-09-26-one-page-no-dependencies.md`).
- The cup is drawn from the game's existing `ICON.cup` path through `svg('cup')`, the same helper the rest of the panel uses for icons.
- Shared classes `.kofi` (the link) and `.kofifoot` (a top border and spacing, so it always reads as a foot note under whatever comes above it) in `src/shell.html`, used in all three places.
- What's new's copy is static HTML in `src/shell.html`. Settings' and the level-up card's copies are built in their render functions (`15-panel.js`, `49-levelup.js`) so they use `svg()` like their surrounding markup.
- From the start; no plan unlocks it, and nothing gates it away.

## Saved state

None. Nothing is read from or written to `G` or `R`.

## Balance

None: a static link, never touched by `update()`. `PLAY` stays identical on seeds 1–3.

## Checks

New `kofi` group (`tools/checks/kofi.mjs`):
- the link is present in What's new, Settings and the level-up card, each with `href="https://ko-fi.com/kylemck"`, `target="_blank"` and `rel="noopener"`;
- with no panel open, no `.kofi` link is visible (it isn't on the airport view, the board or the goal bar);
- the level-up card still fits a 320 px phone with the line added.
- Screenshots of all three at 320 px, phone (390×844), tablet and desktop, looked at before the PR opens.

## Files

- `src/shell.html`: the What's new foot and the `.kofi`/`.kofifoot` styles.
- `src/game/15-panel.js`: the Settings foot, under "Your save".
- `src/game/49-levelup.js`: the level-up card's foot line.
- New: `tools/checks/kofi.mjs`.

## Left out

- No widget, no follow/share buttons, no donation amounts or goals shown in-game.
- No entry in `UPDATES` (What's new) and no version bump: this isn't a feature the player unlocks, so it goes in the roadmap's Done list instead.
