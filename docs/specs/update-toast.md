# Tell players when a new version is ready

Issue: (owner's request, 27 Sep 2026) · Status: Approved (by the owner's request, 27 Sep 2026; `docs/briefs/update-toast.md` describes it) · PRs: (added when it opens)

## What the player gets

Today a player mid-session doesn't know a new version has been published; they only see it next time they load the page. While playing on the published site, the game notices a new version has gone live and offers to load it, without losing their progress.

## What they see

- A toast, in the game's existing style: "A new version of Final Call is ready", with **Update now** and **Later**.
- **Update now** saves the game, then reloads past the browser's cache. The reloaded page loads the same save (through `resetAll`, as always), and shows the What's new card only if the version number went up.
- **Later** hides the toast; it comes back no sooner than an hour later in that tab.
- Never more than one at a time. It doesn't show during the guided start or over the level-up card; it waits until they close.
- Only on the published site (GitHub Pages) — never on a local file, `build/test.html`, or in the headless bot. Nothing to see anywhere else.
- No layout to check: a toast is one line among the existing ones, already proven at 320 px and up.

## How it works

- `tools/build.mjs` stamps a build id (a short hash of the built page) into the page (a `<meta name="build-id">` tag and a `BUILD_ID` constant in the game) and writes it to `dist/version.json`, next to `index.html`. The existing Pages workflow deploys it with no change.
- The published site is detected the same way as the feedback link in Help (`feedbackRepo()`, `src/game/17-help-keys-speed.js`): a host of `<owner>.github.io`. Never in `R.sim`, so never in `build/test.html`, a local file or the headless bot.
- The game fetches `version.json` with `cache: 'no-store'`, every 10 real minutes and when the tab becomes visible again, but not in the first minute after loading. It's quiet on any network error, sends nothing, and fetches nothing else.
- When the id differs from `BUILD_ID`, the toast shows once the guided start and the level-up card are clear, using the existing `toast()` (`10-events-toasts.js`) as it stands.
- Update now saves the game (`save()`, `22-save.js`) and, only once the save is confirmed written, reloads to the same address with a cache-busting query string. If the save can't be confirmed, it doesn't reload, so progress is never lost.

## Saved state

None. Nothing here is added to `G`; the running build id, the pending update and the "hold back until" time are runtime-only.

## Balance

None: no change reachable from `update()`. `PLAY` and `STATE` are unchanged on seeds 1–3 against `main` (the Balance workflow confirms it).

## Checks

A new group, `update` (`tools/checks/update.mjs`), with a fake `https://someone.github.io/final-call/` address (as `feedback`'s check does) routing `version.json`:
- no toast when the served id matches the running build;
- a toast when it differs;
- Update now saves the game and then reloads past the cache;
- Later hides the toast and holds it back for an hour, then it can show again;
- nothing runs off GitHub Pages (`build/test.html`) or with `R.sim` on.

## Files

- `src/game/37-update-check.js` (new): the build id constant, the fetch and its timing, and the toast.
- `tools/build.mjs`: computes and stamps the build id, writes `dist/version.json`, and adds the new file's functions to `window.__sim`.
- `tools/checks/update.mjs` (new).
- `src/shell.html`: the `<meta name="build-id">` marker.
- `docs/SYSTEMS.md`: a short section for this system and the new check group (once #53 and #61 merge; the brief holds this back until then).
- Project notes: the `37-update-check` row in the file table (held back the same way).

## Left out

- No retry or backoff beyond the plain 10-minute interval: a network error is quiet until the next tick.
- No change to the What's new card's own rule (still: shows once the version number rises); this only makes the reload happen sooner.
- No cross-tab coordination: each tab checks and snoozes on its own.
