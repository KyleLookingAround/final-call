---
type: Spec
description: A Roadmap tab on the What's new card that shows players what is coming.
status: stable
verified: { by: human:KyleLookingAround, at: 2026-09-28T20:17:58Z }
---
# A Roadmap tab on What's new

Issue: #137 · Status: Approved (by the owner, 28 Sep 2026, all three defaults in #143) · PRs: #142

## What the player gets

The What's new card gets a second tab, **Roadmap**, next to today's list of changes. It shows what's coming as a departures board — Next update, Boarding, Scheduled, On the radar and Landed — with details on tap and filter chips to narrow the list. The mock-up is `docs/ideas/roadmap-mockup.html`.

## What they see

- **The tabs.** The card's header (`.ptop`) grows a small two-button strip below the title — "What's new" and "Roadmap" — styled like the game's own `.tabs` (the eight main tabs), not the mock-up's pill filters, so the look matches everywhere else the game already has tabs and no second tab style needs adding. Play and Close stay in the footer, shared by both tabs, so switching tabs never moves them.
- **The board.** Filter chips at the top ("All" plus one per status, each with a count), then rows grouped Next update → Boarding → Scheduled → On the radar → Landed, in the mock-up's dark board style (the game's palette, fonts and split-flap status tiles). Each row shows a code (a version such as "V35", or "SOON"/"TBA"/"IDEA"), a title and one short line; tapping opens one to four detail bullets in place.
- **Wording.** Concise UK English, no issue or PR numbers, nothing the owner has rejected. The footer keeps a line close to the mock-up's: "Plans change; older saves always load."
- **On a 320 px phone**, portrait and landscape: the tab strip adds one line under the header; the board scrolls in `#newsBody` beneath it with Play always in view at the foot — the same header/scroll/footer shape #129 already proved for the card, with the tab strip counted as part of the header. Clear of the phone camera band, same as the rest of the dialog (Settings › Screen's reserved band sits above the whole card, not inside it).
- **Tablets and large screens** keep the existing centred card, no taller than the screen.
- **Behaviour.** Hidden during the guided start, exactly as the rest of What's new (`newsDue`). It never touches game state: it's a static list with UI-only filtering and expanding (no `rnd()` calls), and it draws nothing while the card is closed, so it costs nothing reachable from `update()` and needs no change to keep `R.sim` working.

## How it works

- **Where the list lives.** A new source, `src/roadmap.d/`: one file per entry, in the mock-up's shape (`st, code, t, s, d, n`), joined by the build into a `ROADMAP` array in the game — the same pattern `src/updates.d/` uses for `UPDATES`. **Recommended:** keep this separate from `docs/roadmap.d/`, the session-coordination roadmap. That list is written for sessions (issue numbers, ADR links, cost figures, `Section: now/next/runbook/done`) and moves on a different rhythm than a player should see; forcing the two into one file, or one to mechanically mirror the other, would either leak that detail to players or strip `docs/roadmap.d/` of what makes it useful for coordination. Kept in step by process, not a content check: a session that changes what's Next, Boarding, Scheduled or on the Radar for players updates both files in the same PR, the same way `src/updates.d/` and `docs/HISTORY.md` are kept in step today (only the `rules` check ties them, and only on the top version).
  - **Owner's choice, if preferred:** one shared source — `docs/roadmap.d/` gains an optional player-facing field, and a check fails any `next`/`boarding`/`scheduled`/`radar` entry missing one. Simpler in that there's only one list to keep, but every entry then carries both an internal note and player copy, and reordering or wording the internal list has to consider what players will read.
- **Who moves entries.** The release playbook's existing Roadmap step (which already moves a shipped item's `docs/roadmap.d/` file from `now` to `done`) also flips that item's `src/roadmap.d/` status from `next` to `landed` and sets its code to the new version, in the same PR. A spec's approval (the owner approving a `Proposed` spec, as this one will be) moves its `src/roadmap.d/` item from `scheduled` or `radar` to `boarding`, in the PR or comment that records the approval. Every other move (radar → scheduled, reordering Scheduled) stays the owner's, by hand, same as `docs/roadmap.d/` today.
- **Markup.** `#newsBody` swaps between `#newsList` (today's list) and a new `#roadmapList`; the filter chips are a small pill row reusing existing button styling rather than the mock-up's own `.filters`/`.board` CSS, again to keep what's added small.

## Saved state

None. The Roadmap tab reads `ROADMAP`, a static list; it adds no field to `G`. Which filter chip is active and which rows are expanded reset each time the card opens — not saved — the same as the What's new spoiler reveal (`R.newsSpoil`).

## Balance

None: presentation only, nothing reachable from `update()`. `PLAY` and `STATE` stay identical on seeds 1–3 against `main`.

## Checks

- **New `roadmap-card` group** (`news-card`-style): every `src/roadmap.d/` entry, and once released every `ROADMAP` entry, has a known status (`landed|next|boarding|scheduled|radar`), a code, a title, a one-line summary within a length limit, and one to four detail bullets; the filter chips show the right rows and counts, including "All"; a real tap opens a row's details; the tab is hidden during the guided start; the card's existing 320×568/568×320 "newest version and Play in view" checks still pass with the tab strip added. CI cost: the same shape as `news-card` — one page opened once, several `page.evaluate` calls, no extra browser instances — roughly 5–10 seconds.
- **`shots`:** three more screenshots (phone, tablet, desktop) of the Roadmap tab open, reusing pages `shots` already opens for the What's new card. A few seconds in total.
- Added together, well under a minute against the ~1–2 minute full local run and the 25-minute CI ceiling (`checks.yml`'s `timeout-minutes: 25`).

## Files

- **New:** `src/roadmap.d/` (a README like `src/updates.d/README.md`, plus waiting fragments); a new `roadmap-card` check group, its own file in `tools/checks/`.
- **Changed:** `src/game/38-updates.js` (the tab strip, `ROADMAP`, and its render/filter functions — or a new numbered file if that one grows too large, for the building session to judge); `src/shell.html` (the tab strip and Roadmap tab markup/CSS); `docs/SYSTEMS.md` (the new check group and the `src/roadmap.d/` row in the files table); the `release` playbook (the extra half-step above, folded into its existing Roadmap step).

**Page size:** the mock-up's own `<style>`/`<script>` are not committed to the game wholesale — the built version reuses the palette, fonts, `.tabs` and dialog styles already in `src/shell.html`. Roughly 19 entries' worth of data (title, one line, one to four bullets each) at about 150–250 bytes apiece, plus the render/filter code and a little CSS, is an estimated 6–10 KB added to `dist/index.html`. Today's build is 749,056 bytes against the `page-size` check's 861,000-byte budget (#140) — about 112 KB of headroom — so this fits without raising it.

## Left out

- No player action on the board (no voting, no requests): reading only, as the mock-up shows it.
- No picture per item, matching What's new's own "left out".
- No "Show me" from a Roadmap item: it has nowhere concrete to go until it ships. A later spec can add one once an item lands, the same way its `UPDATES` point already can.
- No notification that the Roadmap changed; a player finds it by opening What's new, same as today.
