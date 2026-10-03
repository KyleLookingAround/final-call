---
type: Brief
---
# Brief: Release version 36, the roof terrace and the Roadmap tab

Cut release 36 with the `release` playbook, in one PR on `feature/release-36`. The roof terrace (#181, #133 step 4) and the Roadmap tab on What's new (#180, #137) have merged. The owner parked the public launch on 29 Sep, so the launch week's one-release-a-day rule doesn't hold.

## Goal and what it may touch

- Claim the version first, then fold every fragment in `src/updates.d/`: at most four points, the terrace first, with its "Show me" and level 3; a title that names what's new in the game; a `docs/HISTORY.md` row in concise UK English, leaving out code-only changes.
- Roadmap: the terrace goes from `next` to `landed` with code `V36`, windows on the apron moves to `next`, the shipped items' own files move to `Section: done`, and `docs/roadmap.d/<date>-release-36.md` is added.
- Save fixtures: `G.terrace` and `G.lv.terrace` are new. Run the bot, copy L1, L3, L5 and L9 to `tools/saves/v36-L<n>.json` with `savedAt` backdated past three hours, and add the new `GOLD` lines only.
- Link preview: run `npm run preview` and commit `src/public/` if it changed.
- Final check: a full `npm run check` after merging `main`; once merged, confirm the Pages publish.
- Files it may touch: `src/game/38-updates.js`, `src/updates.d/`, `src/roadmap.d/`, `docs/HISTORY.md`, `tools/saves/`, `tools/checks/migrate.mjs` (new `GOLD` lines only), `src/public/`, `docs/roadmap.d/`, a look back in `docs/lessons/`, and this brief.

## Read first

- The project notes, the `release` and `steward` playbooks.
- `node tools/graph.mjs updates` and `node tools/graph.mjs FIELDS`.

## Speed budget

None: no drawing or simulation code.

## Commit author

KyleLookingAround <KyleMck10@hotmail.com> (the session-start hook sets it).

## Who merges and when

The session writes the look back into the PR, marks it ready and turns on auto-merge (squash) once Checks and Description are green, then books one `send_later` to confirm the merge and the Pages publish.

## What's left for others

Windows and watchers, decor, each layout's floor plan (#133 steps 3, 5 and 6), then refactors 8 and 10. The coordinator updates the players' roadmap page.

## When to stop and ask

Only for something irreversible or outside this brief. Otherwise open an issue labelled `needs-owner` with the question and the default it will take, carry on, and take the default after 12 hours with no answer, saying so in the PR. Where it's merely unclear, take the safer option and say so in the PR.

## Cost budget

Estimate: about $5. Past twice that, say why in the PR and its lesson.
