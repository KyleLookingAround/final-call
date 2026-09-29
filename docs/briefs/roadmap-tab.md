# Brief: A Roadmap tab on What's new, the build (#137)

The owner approved the spec, `docs/specs/roadmap-tab.md`, on 28 Sep with all three defaults (#143). This session builds it.

## Goal and what it may touch

- Build the spec as written: a "What's new | Roadmap" tab strip on the What's new card; the Roadmap tab showing `ROADMAP` as a departures board with filter chips and tap-to-open details; and `src/roadmap.d/`, one file per entry, joined by the build (separate from `docs/roadmap.d/`, the recommended default).
- Write the first entries from the owner's mock-up (`docs/ideas/roadmap-mockup.html`), brought up to date with `docs/ROADMAP.md` on today's `main`: release 35 is Landed; the roof terrace is Next update (building now); windows, decor and each layout's floor plan are Scheduled. Use concise UK English, no issue or PR numbers, and nothing the owner has rejected. Keep the footer line "Plans change; older saves always load."
- Add the new `roadmap-card` check group and the three `shots` screenshots, as the spec's "Checks" says. Fold the release playbook's half-step into its Roadmap step.
- Branch `feature/roadmap-tab` from `main`, one PR that closes #137.
- Files it may touch: those the spec's "Files" lists (`src/roadmap.d/`, `tools/checks/roadmap-card.mjs`, `src/game/38-updates.js` or a new numbered file before `99-start.js`, `src/shell.html`, `docs/SYSTEMS.md`'s rows, the `release` playbook), `tools/build.mjs` and `tools/join.mjs` only as far as joining `src/roadmap.d/` needs, `tools/checks/shots.mjs` for the three screenshots, one What's new fragment in `src/updates.d/`, the roadmap item `docs/roadmap.d/2026-09-28-roadmap-tab.md`, a new `docs/systems/` note if the tab gets its own file, and this PR's look back. Anything else is outside the brief.

## Read first

- The project notes, then `node tools/graph.mjs 38-updates.js`, `node tools/graph.mjs news-card` and `node tools/graph.mjs join.mjs`, and only what they list.
- `docs/specs/roadmap-tab.md`, `docs/ideas/roadmap-mockup.html`, `src/updates.d/README.md`, `docs/ROADMAP.md`, the `feature`, `steward` and `release` playbooks.

## Speed budget

None: presentation only, nothing reachable from `update()`, and it draws nothing while the card is closed. `PLAY` must stay identical on seeds 1–3 against the merge base (`STATE` may move only through the What's new entry). The page must stay inside the `page-size` check's budget; say the bytes added in the PR.

## Commit author

KyleLookingAround <KyleMck10@hotmail.com> (the session-start hook sets it; check `git config user.email`).

## Who merges and when

The session, with Squash and merge once checks are green, then confirms the Pages publish. Subscribe to the PR's events (`subscribe_pr_activity`) once it's open and keep a `send_later` (about 20 minutes) as the fallback. Before opening it, look at the screenshots at 320×568, 568×320, 390×844, 768×1024 and 1440×900, with the camera band on. Its look back goes in `docs/lessons/<pr>-roadmap-tab.md`.

## What's left for others

- The roof terrace session is building `src/game/67-terrace.js` at the same time: don't touch it or any terminal-place file. Both PRs add a What's new fragment and rows in `docs/SYSTEMS.md`'s joined lists, which are one file each, so they don't clash.
- No release: the coordinator starts one. Don't start sessions. At most three default-model sessions run at once.

## When to stop and ask

- Only for something irreversible or outside this brief.
- Otherwise, if it truly needs the owner: open an issue labelled `needs-owner` with the question and the option it will take by default, carry on with other work, look at the issue at each stopping point, and take the default after 12 hours with no answer. Say so in the PR.
- Where it's merely unclear, take the safer option (easier to undo, or changing the game less) and say so in the PR.

## Cost budget

- Estimate: about $10 (a tab, a board with filters, a new source folder joined by the build, one check group, screenshots at five sizes, two CI rounds).
- At each stopping point (a PR opened, CI back, a merge), read `get_session`: `usage.cost_usd` against the estimate (a 0 means not yet known, not free), and `rate_limit_info`. If status is "rejected" or `isUsingOverage` is true, schedule a `send_later` for a minute after `resetsAt` and end the turn. Ignore `allowed_warning` (the owner's call, 29 Sep).
- Past twice the estimate: say why in the PR and in its lesson (`docs/lessons/`), and trim or split what's left.
