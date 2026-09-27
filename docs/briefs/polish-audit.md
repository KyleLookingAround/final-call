# Brief: Polish audit

## Goal and what it may touch

- The owner asked how to make the game feel polished, and chose a polish loop: first this audit, which only looks and lists, then small fix batches in later sessions. Deliver a ranked punch list of everything that makes Final Call feel unfinished, found by playing and looking, not by reading code alone. One PR on `feature/polish-audit` from `main`, docs only, plus GitHub issues.
- Play and look at:
  - the ready-made airports at levels 1, 3, 5 and 9 (`tools/saves/v29-L*.json`, or `build/saves/` from a bot run), seeded through `localStorage['final-call-save-v2']` and `window.__seed`;
  - at phone (390×844 and 320×568, `hasTouch`, `isMobile`, portrait and landscape), tablet (768×1024) and desktop (1440×900), by day and night, in the airport view, the board, each panel tab, the Region, the world map, the Masterplan, Settings, Help, What's new, the level-up card, toasts and the guided start from a new game;
  - a few minutes of play at 1× and 4× in each, watching what moves and what should but doesn't.
- Look for:
  - things that break the illusion: the board's network (every own plane to one city at level 9), a rating pinned at 91–100, noisy region news, managers and recommendations that contradict each other, a Masterplan with no guidance (all from `docs/specs/systems-review.md`, "What the play showed"); confirm or update each;
  - missing feedback: numbers that jump rather than move, builds that open with no sign, taps with no response, anything that happens off-screen with no pointer to it;
  - inconsistency: toasts, cards, buttons, spacing, fonts, icons, wording (UK English, concise), colours by day and night;
  - rough edges: overlaps, clipping, text too small or cut off, touch targets under 44 px, the phone camera band, anything at 320 px, console errors, slow frames.
- Write `docs/ideas/polish-2026-09.md`: a table ranked by how much a player notices it against how small the fix is, each row with where it is (screen, size, level), what's wrong, the fix in a sentence, size (small/medium/large), the files it would touch, and a screenshot name. Group rows into suggested fix batches of 3–5 items that touch the same files, noting which batches would collide with "The terminal as a place" (its spec is `docs/specs/terminal-place.md`) so they can be ordered round it.
- Open one GitHub issue per batch (Feature template), labelled `polish` (create the label if it's missing), each listing its rows. Nothing is fixed in this session.
- Files it may touch: `docs/ideas/polish-2026-09.md`, `docs/ROADMAP.md` (one line pointing at it), `docs/LESSONS.md` (its look back), `docs/briefs/polish-audit.md` (this brief). Scripts and screenshots stay in `build/` (git-ignored). No game code.

## Read first

- The project notes (the owner's preferences in particular), the `feature` playbook's section on looking at screenshots, and `docs/specs/systems-review.md` Part 1.
- `node tools/graph.mjs toast` and `node tools/graph.mjs layout`, and only what they list; `docs/SYSTEMS.md` sections on UI, views and phone layout.
- `docs/ideas/board-2026-09.md` "Onboarding and help", so the list doesn't repeat ideas already there (link to them instead).

## Speed budget

None: no game code.

## Commit author

KyleLookingAround <KyleMck10@hotmail.com> (the session-start hook sets it; check `git config user.email`).

## Who merges and when

The session, with Squash and merge once Checks and Description are green on a head up to date with `main`, then confirms the Pages publish. The release session (version 32, `feature/release-32`) is merging now and also writes `docs/LESSONS.md` and `docs/ROADMAP.md`: fetch `main` before your last push and keep every entry. Book your own `send_later` check-ins and delete them once merged.

## What's left for others

- Not the fixes: each batch goes to a fresh session from its own brief, started by the coordinator, ordered round "The terminal as a place".
- After this: "The terminal as a place" (approved on #48): its checks-first PR, then its groundwork, then its parts, with refactor steps from the systems review (`docs/specs/systems-review.md`, approved in full on #65); the second half of faster CI (experiment [B]: run only the check groups the graph says a change touches, on draft PRs); the polish batches; then the systems review's design proposals in its recommended order, the idea board (`docs/ideas/board-2026-09.md`) and `docs/ROADMAP.md`.
- Routine jobs (look backs, save fixtures, doc moves, screenshot reviews) go to the cheaper model (experiment [C]). Pass this list on in any brief this session writes.

## When to stop and ask

- Only for something irreversible or outside this brief.
- Otherwise, if it truly needs the owner: open an issue labelled `needs-owner` with the question and the option it will take by default, carry on with other work, look at the issue at each stopping point, and take the default after 12 hours with no answer. Say so in the PR.
- Where it's merely unclear, take the safer option (easier to undo, or changing the game less) and say so in the PR.

## Cost budget

- Estimate: about $6 (screenshot scripts at four sizes and four levels, reading the images, one docs PR, one CI round). Screenshots are the cost: take them in batches and look at each once.
- At each stopping point (a PR opened, CI back, a merge), read `get_session`: `usage.cost_usd` against the estimate (a 0 means not yet known, not free), and `rate_limit_info`. If status is "rejected" or `isUsingOverage` is true, schedule a `send_later` for a minute after `resetsAt` and end the turn.
- Past twice the estimate: say why in the PR and in `docs/LESSONS.md`, and trim or split what's left.
