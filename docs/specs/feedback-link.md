---
type: Spec
description: A link in Help that lets players send feedback.
status: stable
verified: { by: human:KyleLookingAround, at: "2026-09-27T12:30:08Z" }
---
# A feedback link in Help

Issue: (Roadmap "Next": "Feedback from players") · PRs: (added when it opens) · Status: Approved (a small change the owner allowed in the coordinator's session of 27 Sep 2026; `docs/briefs/feedback-link.md` describes it)

## What the player gets

Today a player with something to report has no way to tell the developer from inside the game. A "Send feedback" link in Help opens a new GitHub issue for the game's repo, in a new tab, with the details that help a bug report already filled in. The player still writes the title and can edit or clear the body before sending; the game itself sends nothing.

## What they see

- In Help, under the existing "Replay the guided start · What's new" line: a "Send feedback" link, styled the same way.
- Only when the game is served from GitHub Pages. Anywhere else (a local file, `build/test.html`), the link is hidden, not greyed out, matching how locked items are hidden elsewhere.
- Following it opens `github.com/<owner>/<repo>/issues/new` in a new tab with the body filled in and the title left empty. It fits a 320 px phone, a landscape phone, a tablet and a large screen, since it's one line among existing ones.

## How it works

- The repo is read from where the page is served: a host of `<owner>.github.io` and the first path segment as `<repo>` (how GitHub Pages serves a project site). Anywhere else, `feedbackRepo()` returns nothing and the link stays hidden.
- The link's `href` is built when Help opens (`openHelp`, `src/game/17-help-keys-speed.js`), so it always reflects the current game and screen. The body lists, one per line: the game's version (`UPDATES[0].v`), the level (`LEVELS[G.level].name`), the layout (`LAYOUTS[G.layout].name`), the game day (`G.day`), the screen size (`innerWidth`×`innerHeight`) and the device type (touch or not, from `matchMedia('(pointer:coarse)')`).
- No plan or level gates it: it's a Help link, available from the start.

## Saved state

None. It reads existing fields (`G.level`, `G.layout`, `G.day`) and sends nothing.

## Balance

None: a Help link only, built when Help opens. The bot's `PLAY` is unchanged on seeds 1–3.

## Checks

A new group, `feedback` (`tools/checks/feedback.mjs`):
- the link is hidden on `build/test.html` (a local file, no GitHub Pages host);
- with the location faked as `https://someone.github.io/final-call/`, the link points at `github.com/someone/final-call/issues/new` with the body filled in;
- the body stays under GitHub's URL length limit on a level 9 airport (`tools/saves/v29-L9.json` or newer).
- Screenshots of Help at 320 px, phone (390×844), tablet and desktop, looked at before the PR opens.

## Files

- `src/game/17-help-keys-speed.js`: builds the link's `href` and hidden state when Help opens.
- `src/shell.html`: the link's markup and CSS, next to the existing Help links.
- `tools/checks/feedback.mjs` (new). `tools/build.mjs`: adds a function to `window.__sim` if the check needs one.
- `docs/SYSTEMS.md`: a line for the `feedback` check group. `docs/ROADMAP.md`: moves the item to Done.

## Left out

- No tracking of whether a player follows the link or files an issue.
- No in-game form or screenshot attachment: GitHub's own issue form handles that once the tab opens.
- No change to what's shown when the game isn't served from GitHub Pages beyond hiding the link.
