# <Feature name>

Issue: #<number> · Status: Proposed | Approved | Built · PRs: #<number>, … (added as they open)

Copy this file to `docs/specs/<short-name>.md`. Keep it to a page. The owner approves it before building starts.

## What the player gets

The goal or problem in two or three sentences, from the player's side.

## What they see

- On the map, board and gates (impacts show there, not as text events).
- In the panel: which tab and sub-tab, what's new there.
- On a 320 px phone, a landscape phone, a tablet and a large screen.

## How it works

- The rules, with the numbers that matter.
- When it unlocks: a Masterplan plan (`has('feat:…')`), a level, or from the start. Locked things are hidden, not greyed out.
- Managers and recommendations: what they do for players who'd rather not handle it.

## Saved state

- New fields in `G`, their defaults in `DEFAULT()`, and how `resetAll` handles saves without them.
- Nothing is renamed or removed.

## Balance

- Expected effect on the level baselines (`tools/baseline.json`), and on cash, rating or Lowmere's share.
- If pacing should change, by how much, and whether the owner has agreed.

## Checks

- New `rules` checks that prove it works.
- Anything the layout, saves or tour checks need to cover.
- What to look at in the screenshots.

## Files

Which `src/game/` files change, and whether it needs a new file.

## Left out

What this deliberately doesn't do, so it doesn't creep.
